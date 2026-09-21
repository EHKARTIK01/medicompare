package com.medicompare.controller;

import com.medicompare.dto.hospital.PriceComparisonResponse;
import com.medicompare.service.PriceComparisonService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/compare")
@RequiredArgsConstructor
public class PriceComparisonController {

    private final PriceComparisonService priceComparisonService;

    @GetMapping
    public PriceComparisonResponse compare(@RequestParam String service,
                                            @RequestParam(required = false) String city,
                                            @RequestParam(required = false) Double lat,
                                            @RequestParam(required = false) Double lng,
                                            @RequestParam(required = false, defaultValue = "price_asc") String sortBy) {
        return priceComparisonService.compare(service, city, lat, lng, sortBy);
    }
}
