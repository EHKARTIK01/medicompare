package com.medicompare.controller;

import com.medicompare.dto.payment.CreateOrderRequest;
import com.medicompare.dto.payment.CreateOrderResponse;
import com.medicompare.dto.payment.VerifyPaymentRequest;
import com.medicompare.security.UserPrincipal;
import com.medicompare.service.PaymentGatewayService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentGatewayService paymentGatewayService;

    @PostMapping("/create-order")
    public CreateOrderResponse createOrder(@AuthenticationPrincipal UserPrincipal principal,
                                            @Valid @RequestBody CreateOrderRequest request) {
        return paymentGatewayService.createOrder(principal.getId(), request.getAppointmentId());
    }

    /**
     * Verifies payment server-side. Frontend NEVER decides success on its own -
     * this endpoint independently checks the Razorpay signature (or the mock
     * equivalent) before the appointment is confirmed.
     */
    @PostMapping("/verify")
    public ResponseEntity<Void> verify(@Valid @RequestBody VerifyPaymentRequest request) {
        paymentGatewayService.verifyAndConfirm(request);
        return ResponseEntity.ok().build();
    }
}
