package com.medicompare.dto.payment;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateOrderResponse {
    private String razorpayOrderId;
    private String razorpayKeyId;   // public key, safe for frontend
    private BigDecimal amount;
    private String currency;
    private boolean mockMode;
}
