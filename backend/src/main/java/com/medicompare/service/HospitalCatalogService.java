package com.medicompare.service;

import com.medicompare.dto.hospital.HospitalResponse;
import com.medicompare.dto.hospital.HospitalUpsertRequest;
import com.medicompare.entity.Hospital;
import com.medicompare.exception.ResourceNotFoundException;
import com.medicompare.repository.HospitalRepository;
import com.medicompare.util.DistanceUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HospitalCatalogService {

    private final HospitalRepository hospitalRepository;

    @Cacheable(value = "hospitalSearch", key = "#city + '-' + #locality + '-' + #query + '-' + #pageable.pageNumber")
    public Page<HospitalResponse> search(String city, String locality, String query, Pageable pageable) {
        return hospitalRepository.search(blankToNull(city), blankToNull(locality), blankToNull(query), pageable)
                .map(h -> toResponse(h, null, null));
    }

    @Cacheable(value = "hospitalDetails", key = "#id")
    public HospitalResponse getById(Long id) {
        Hospital hospital = hospitalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hospital not found with id: " + id));
        return toResponse(hospital, null, null);
    }

    public List<HospitalResponse> findNearby(double lat, double lng, double radiusKm) {
        return hospitalRepository.findAll().stream()
                .map(h -> toResponse(h, lat, lng))
                .filter(r -> r.getDistanceKm() != null && r.getDistanceKm() <= radiusKm)
                .sorted((a, b) -> Double.compare(a.getDistanceKm(), b.getDistanceKm()))
                .collect(Collectors.toList());
    }

    @Transactional
    @CacheEvict(value = {"hospitalSearch", "hospitalDetails", "priceComparison"}, allEntries = true)
    public HospitalResponse create(HospitalUpsertRequest request) {
        Hospital hospital = Hospital.builder()
                .name(request.getName())
                .address(request.getAddress())
                .city(request.getCity())
                .locality(request.getLocality())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .phone(request.getPhone())
                .email(request.getEmail())
                .description(request.getDescription())
                .facilities(request.getFacilities())
                .specialties(request.getSpecialties())
                .openingHours(request.getOpeningHours())
                .available(request.isAvailable())
                .verified(request.isVerified())
                .rating(0.0)
                .reviewCount(0)
                .build();
        return toResponse(hospitalRepository.save(hospital), null, null);
    }

    @Transactional
    @CacheEvict(value = {"hospitalSearch", "hospitalDetails", "priceComparison"}, allEntries = true)
    public HospitalResponse update(Long id, HospitalUpsertRequest request) {
        Hospital hospital = hospitalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hospital not found with id: " + id));
        hospital.setName(request.getName());
        hospital.setAddress(request.getAddress());
        hospital.setCity(request.getCity());
        hospital.setLocality(request.getLocality());
        hospital.setLatitude(request.getLatitude());
        hospital.setLongitude(request.getLongitude());
        hospital.setPhone(request.getPhone());
        hospital.setEmail(request.getEmail());
        hospital.setDescription(request.getDescription());
        hospital.setFacilities(request.getFacilities());
        hospital.setSpecialties(request.getSpecialties());
        hospital.setOpeningHours(request.getOpeningHours());
        hospital.setAvailable(request.isAvailable());
        hospital.setVerified(request.isVerified());
        return toResponse(hospitalRepository.save(hospital), null, null);
    }

    @Transactional
    @CacheEvict(value = {"hospitalSearch", "hospitalDetails", "priceComparison"}, allEntries = true)
    public void delete(Long id) {
        if (!hospitalRepository.existsById(id)) {
            throw new ResourceNotFoundException("Hospital not found with id: " + id);
        }
        hospitalRepository.deleteById(id);
    }

    private String blankToNull(String s) {
        return (s == null || s.isBlank()) ? null : s.trim();
    }

    private HospitalResponse toResponse(Hospital h, Double userLat, Double userLng) {
        Double distance = null;
        if (userLat != null && userLng != null) {
            distance = DistanceUtil.distanceKm(userLat, userLng, h.getLatitude(), h.getLongitude());
        }
        return HospitalResponse.builder()
                .id(h.getId())
                .name(h.getName())
                .address(h.getAddress())
                .city(h.getCity())
                .locality(h.getLocality())
                .latitude(h.getLatitude())
                .longitude(h.getLongitude())
                .rating(h.getRating())
                .reviewCount(h.getReviewCount())
                .phone(h.getPhone())
                .email(h.getEmail())
                .description(h.getDescription())
                .facilities(splitCsv(h.getFacilities()))
                .specialties(splitCsv(h.getSpecialties()))
                .openingHours(h.getOpeningHours())
                .available(h.isAvailable())
                .verified(h.isVerified())
                .distanceKm(distance)
                .build();
    }

    private List<String> splitCsv(String csv) {
        if (csv == null || csv.isBlank()) return List.of();
        return Arrays.stream(csv.split(",")).map(String::trim).filter(s -> !s.isEmpty()).toList();
    }
}
