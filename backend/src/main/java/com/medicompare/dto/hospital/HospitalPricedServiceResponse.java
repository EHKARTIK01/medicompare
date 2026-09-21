package com.medicompare.dto.hospital;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HospitalPricedServiceResponse {
    private Long hospitalServiceId;
    private Long medicalServiceId;
    private String serviceName;
    private String category;
    private BigDecimal price;
    private boolean available;
}
