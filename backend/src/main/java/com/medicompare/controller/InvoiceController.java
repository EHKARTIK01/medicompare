package com.medicompare.controller;

import com.medicompare.entity.Invoice;
import com.medicompare.repository.InvoiceRepository;
import com.medicompare.repository.PaymentRepository;
import com.medicompare.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/invoices")
@RequiredArgsConstructor
public class InvoiceController {

    private final InvoiceRepository invoiceRepository;
    private final PaymentRepository paymentRepository;

    @GetMapping("/payment/{paymentId}")
    public Invoice byPayment(@PathVariable Long paymentId) {
        return invoiceRepository.findByPaymentId(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found for this payment"));
    }

    @GetMapping("/appointment/{appointmentId}")
    public Invoice byAppointment(@PathVariable Long appointmentId) {
        var payment = paymentRepository.findByAppointmentId(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("No payment found for this appointment"));
        return invoiceRepository.findByPaymentId(payment.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not yet generated for this appointment"));
    }
}
