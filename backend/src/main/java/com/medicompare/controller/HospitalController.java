package com.medicompare.controller;

import com.medicompare.dto.hospital.HospitalPricedServiceResponse;
import com.medicompare.dto.hospital.HospitalResponse;
import com.medicompare.repository.HospitalServiceRepository;
import com.medicompare.service.HospitalCatalogService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/hospitals")
@RequiredArgsConstructor
public class HospitalController {

    private final HospitalCatalogService hospitalCatalogService;
    private final HospitalServiceRepository hospitalServiceRepository;

    /** Public: priced, bookable services offered at this hospital (used by the booking widget). */
    @GetMapping("/{id}/services")
    public List<HospitalPricedServiceResponse> servicesForHospital(@PathVariable Long id) {
        return hospitalServiceRepository.findByHospitalId(id).stream()
                .map(hs -> HospitalPricedServiceResponse.builder()
                        .hospitalServiceId(hs.getId())
                        .medicalServiceId(hs.getMedicalService().getId())
                        .serviceName(hs.getMedicalService().getName())
                        .category(hs.getMedicalService().getCategory())
                        .price(hs.getPrice())
                        .available(hs.isAvailable())
                        .build())
                .toList();
    }

    /** Public search. Empty params returns all demo hospitals (paginated). */
    @GetMapping
    public Page<HospitalResponse> search(@RequestParam(required = false) String city,
                                          @RequestParam(required = false) String locality,
                                          @RequestParam(required = false) String query,
                                          @RequestParam(defaultValue = "0") int page,
                                          @RequestParam(defaultValue = "12") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return hospitalCatalogService.search(city, locality, query, pageable);
    }

    @GetMapping("/{id}")
    public HospitalResponse getById(@PathVariable Long id) {
        return hospitalCatalogService.getById(id);
    }

    @GetMapping("/nearby")
    public List<HospitalResponse> nearby(@RequestParam double lat,
                                          @RequestParam double lng,
                                          @RequestParam(defaultValue = "15") double radiusKm) {
        return hospitalCatalogService.findNearby(lat, lng, radiusKm);
    }
}
