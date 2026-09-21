package com.medicompare.controller;

import com.medicompare.entity.Payment;
import com.medicompare.entity.PaymentStatus;
import com.medicompare.repository.PaymentRepository;
import com.razorpay.Utils;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Handles Razorpay's server-to-server webhook (e.g. payment.captured,
 * payment.failed) as a defensive backstop alongside the synchronous
 * /api/payments/verify flow — useful if the user closes the browser before the
 * client-side handler fires. Requires RAZORPAY_WEBHOOK_SECRET to be configured;
 * if it isn't, the endpoint safely no-ops (logs and returns 200) rather than
 * pretending to have verified anything, since without a secret we cannot trust
 * the payload's authenticity.
 */
@RestController
@RequestMapping("/api/webhooks/razorpay")
@RequiredArgsConstructor
@Slf4j
public class RazorpayWebhookController {

    private final PaymentRepository paymentRepository;

    @Value("${razorpay.webhook-secret:}")
    private String webhookSecret;

    @PostMapping
    public ResponseEntity<String> handleWebhook(@RequestBody String payload,
                                                 @RequestHeader(value = "X-Razorpay-Signature", required = false) String signature) {
        if (webhookSecret == null || webhookSecret.isBlank()) {
            log.warn("Received Razorpay webhook but RAZORPAY_WEBHOOK_SECRET is not configured — ignoring payload.");
            return ResponseEntity.ok("ignored: webhook secret not configured");
        }

        try {
            boolean valid = Utils.verifyWebhookSignature(payload, signature, webhookSecret);
            if (!valid) {
                log.warn("Razorpay webhook signature verification failed.");
                return ResponseEntity.status(400).body("invalid signature");
            }

            JSONObject json = new JSONObject(payload);
            String event = json.optString("event", "unknown");
            log.info("Verified Razorpay webhook event received: {}", event);

            if ("payment.captured".equals(event)) {
                String orderId = json.getJSONObject("payload").getJSONObject("payment")
                        .getJSONObject("entity").optString("order_id");
                paymentRepository.findByRazorpayOrderId(orderId).ifPresent(payment -> {
                    if (payment.getStatus() != PaymentStatus.PAID) {
                        payment.setStatus(PaymentStatus.PAID);
                        paymentRepository.save(payment);
                        log.info("Payment {} marked PAID via webhook backstop.", payment.getId());
                    }
                });
            }

            return ResponseEntity.ok("ok");
        } catch (Exception e) {
            log.error("Error processing Razorpay webhook: {}", e.getMessage());
            return ResponseEntity.status(500).body("error processing webhook");
        }
    }
}
