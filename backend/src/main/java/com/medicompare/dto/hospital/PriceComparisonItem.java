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
public class PriceComparisonItem {
    private Long hospitalId;
    private String hospitalName;
    private String city;
    private String locality;
    private BigDecimal price;
    private Double rating;
    private Integer reviewCount;
    private Double distanceKm;
    private boolean available;
    private Long hospitalServiceId;
}
