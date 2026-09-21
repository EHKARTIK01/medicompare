package com.medicompare.dto.payment;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class VerifyPaymentRequest {
    @NotNull private Long appointmentId;
    private String razorpayOrderId;
    private String razorpayPaymentId;
    private String razorpaySignature;
}
