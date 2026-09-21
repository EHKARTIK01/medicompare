package com.medicompare.controller;

import com.medicompare.entity.Payment;
import com.medicompare.repository.PaymentRepository;
import com.medicompare.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentHistoryController {

    private final PaymentRepository paymentRepository;

    @GetMapping("/me")
    public List<Payment> myPaymentHistory(@AuthenticationPrincipal UserPrincipal principal) {
        return paymentRepository.findByAppointment_User_IdOrderByCreatedAtDesc(principal.getId());
    }
}
