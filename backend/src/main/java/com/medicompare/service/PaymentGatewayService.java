package com.medicompare.service;

import com.medicompare.dto.payment.CreateOrderResponse;
import com.medicompare.dto.payment.VerifyPaymentRequest;
import com.medicompare.entity.*;
import com.medicompare.exception.BadRequestException;
import com.medicompare.exception.ResourceNotFoundException;
import com.medicompare.repository.*;
import com.medicompare.util.InvoiceNumberGenerator;
import com.razorpay.RazorpayClient;
import com.razorpay.Utils;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * Handles Razorpay order creation and signature verification.
 *
 * IMPORTANT: payment success is NEVER trusted from the frontend directly.
 * The signature is always verified server-side before an appointment is confirmed.
 *
 * If no Razorpay credentials are configured (razorpay.mock-mode=true, the default
 * for local/demo use), a simulated order + signature flow is used instead so the
 * whole booking journey can still be demonstrated end-to-end without real keys.
 */
@Service
@RequiredArgsConstructor
public class PaymentGatewayService {

    private final PaymentRepository paymentRepository;
    private final AppointmentRepository appointmentRepository;
    private final HospitalServiceRepository hospitalServiceRepository;
    private final InvoiceRepository invoiceRepository;
    private final AppointmentBookingService appointmentBookingService;
    private final EmailNotificationService emailNotificationService;

    @Value("${razorpay.key-id}")
    private String keyId;

    @Value("${razorpay.key-secret}")
    private String keySecret;

    @Value("${razorpay.mock-mode}")
    private boolean mockMode;

    @Transactional
    public CreateOrderResponse createOrder(Long userId, Long appointmentId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));

        if (!appointment.getUser().getId().equals(userId)) {
            throw new BadRequestException("You can only pay for your own appointments");
        }

        BigDecimal amount = hospitalServiceRepository
                .findByHospitalIdAndMedicalServiceId(appointment.getHospital().getId(), appointment.getMedicalService().getId())
                .map(HospitalService::getPrice)
                .orElseThrow(() -> new ResourceNotFoundException("Price not found for this hospital/service combination"));

        boolean useMock = mockMode || keyId == null || keyId.isBlank() || keySecret == null || keySecret.isBlank();

        String orderId;
        if (useMock) {
            orderId = "mock_order_" + UUID.randomUUID().toString().replace("-", "").substring(0, 16);
        } else {
            try {
                RazorpayClient client = new RazorpayClient(keyId, keySecret);
                Map<String, Object> orderRequest = new HashMap<>();
                orderRequest.put("amount", amount.multiply(BigDecimal.valueOf(100)).intValue()); // paise
                orderRequest.put("currency", "INR");
                orderRequest.put("receipt", "appt_" + appointmentId);
                orderId = client.orders.create(new org.json.JSONObject(orderRequest)).get("id");
            } catch (Exception e) {
                throw new BadRequestException("Unable to create payment order: " + e.getMessage());
            }
        }

        Payment payment = Payment.builder()
                .appointment(appointment)
                .razorpayOrderId(orderId)
                .amount(amount)
                .currency("INR")
                .status(PaymentStatus.CREATED)
                .mock(useMock)
                .build();
        paymentRepository.save(payment);

        return CreateOrderResponse.builder()
                .razorpayOrderId(orderId)
                .razorpayKeyId(useMock ? "mock_key" : keyId)
                .amount(amount)
                .currency("INR")
                .mockMode(useMock)
                .build();
    }

    /**
     * Verifies the payment signature server-side (or accepts the simulated mock
     * confirmation in mock mode) and only then marks the appointment as CONFIRMED
     * and generates an invoice.
     */
    @Transactional
    public void verifyAndConfirm(VerifyPaymentRequest request) {
        Payment payment = paymentRepository.findByRazorpayOrderId(request.getRazorpayOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("Payment order not found"));

        if (payment.isMock()) {
            // Simulated confirmation path for local/demo use - no real gateway involved.
            payment.setRazorpayPaymentId("mock_pay_" + UUID.randomUUID().toString().replace("-", "").substring(0, 16));
            payment.setStatus(PaymentStatus.PAID);
        } else {
            try {
                Map<String, String> params = new HashMap<>();
                params.put("razorpay_order_id", request.getRazorpayOrderId());
                params.put("razorpay_payment_id", request.getRazorpayPaymentId());
                params.put("razorpay_signature", request.getRazorpaySignature());
                boolean valid = Utils.verifyPaymentSignature(params, keySecret);
                if (!valid) {
                    payment.setStatus(PaymentStatus.FAILED);
                    paymentRepository.save(payment);
                    throw new BadRequestException("Payment signature verification failed");
                }
                payment.setRazorpayPaymentId(request.getRazorpayPaymentId());
                payment.setRazorpaySignature(request.getRazorpaySignature());
                payment.setStatus(PaymentStatus.PAID);
            } catch (Exception e) {
                throw new BadRequestException("Payment verification error: " + e.getMessage());
            }
        }

        paymentRepository.save(payment);
        appointmentBookingService.markConfirmed(payment.getAppointment().getId());

        Invoice invoice = Invoice.builder()
                .payment(payment)
                .invoiceNumber(InvoiceNumberGenerator.next())
                .totalAmount(payment.getAmount())
                .build();
        invoiceRepository.save(invoice);

        Appointment appointment = payment.getAppointment();
        emailNotificationService.sendAppointmentConfirmation(
                appointment.getUser().getEmail(),
                appointment.getPatientName(),
                appointment.getHospital().getName(),
                appointment.getMedicalService().getName(),
                appointment.getSlot() != null ? appointment.getSlot().getSlotDate().toString() : "N/A",
                appointment.getSlot() != null ? appointment.getSlot().getSlotTime().toString() : "N/A"
        );
    }
}
