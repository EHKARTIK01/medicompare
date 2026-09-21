package com.medicompare.service;

import com.medicompare.dto.hospital.PriceComparisonItem;
import com.medicompare.dto.hospital.PriceComparisonResponse;
import com.medicompare.entity.HospitalService;
import com.medicompare.exception.ResourceNotFoundException;
import com.medicompare.repository.HospitalServiceRepository;
import com.medicompare.repository.MedicalServiceRepository;
import com.medicompare.util.DistanceUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PriceComparisonService {

    private final HospitalServiceRepository hospitalServiceRepository;
    private final MedicalServiceRepository medicalServiceRepository;

    @Cacheable(value = "priceComparison", key = "#serviceName + '-' + #city + '-' + #userLat + '-' + #userLng + '-' + #sortBy")
    public PriceComparisonResponse compare(String serviceName, String city, Double userLat, Double userLng, String sortBy) {
        medicalServiceRepository.findByNameIgnoreCase(serviceName)
                .orElseThrow(() -> new ResourceNotFoundException("Medical service not found: " + serviceName));

        List<HospitalService> rows = hospitalServiceRepository.findForComparison(serviceName, city);

        List<PriceComparisonItem> items = rows.stream().map(hs -> {
            Double distance = null;
            if (userLat != null && userLng != null) {
                distance = DistanceUtil.distanceKm(userLat, userLng, hs.getHospital().getLatitude(), hs.getHospital().getLongitude());
            }
            return PriceComparisonItem.builder()
                    .hospitalId(hs.getHospital().getId())
                    .hospitalName(hs.getHospital().getName())
                    .city(hs.getHospital().getCity())
                    .locality(hs.getHospital().getLocality())
                    .price(hs.getPrice())
                    .rating(hs.getHospital().getRating())
                    .reviewCount(hs.getHospital().getReviewCount())
                    .distanceKm(distance)
                    .available(hs.isAvailable() && hs.getHospital().isAvailable())
                    .hospitalServiceId(hs.getId())
                    .build();
        }).collect(java.util.stream.Collectors.toList());

        applySort(items, sortBy);

        BigDecimal lowest = items.stream().map(PriceComparisonItem::getPrice).min(BigDecimal::compareTo).orElse(BigDecimal.ZERO);
        BigDecimal highest = items.stream().map(PriceComparisonItem::getPrice).max(BigDecimal::compareTo).orElse(BigDecimal.ZERO);
        BigDecimal average = items.isEmpty() ? BigDecimal.ZERO :
                items.stream().map(PriceComparisonItem::getPrice).reduce(BigDecimal.ZERO, BigDecimal::add)
                        .divide(BigDecimal.valueOf(items.size()), 2, RoundingMode.HALF_UP);

        return PriceComparisonResponse.builder()
                .serviceName(serviceName)
                .lowestPrice(lowest)
                .highestPrice(highest)
                .averagePrice(average)
                .results(items)
                .build();
    }

    private void applySort(List<PriceComparisonItem> items, String sortBy) {
        if (sortBy == null) sortBy = "price_asc";
        switch (sortBy) {
            case "price_desc" -> items.sort(Comparator.comparing(PriceComparisonItem::getPrice).reversed());
            case "rating" -> items.sort(Comparator.comparing(PriceComparisonItem::getRating,
                    Comparator.nullsLast(Comparator.reverseOrder())));
            case "distance" -> items.sort(Comparator.comparing(PriceComparisonItem::getDistanceKm,
                    Comparator.nullsLast(Comparator.naturalOrder())));
            default -> items.sort(Comparator.comparing(PriceComparisonItem::getPrice));
        }
    }
}
