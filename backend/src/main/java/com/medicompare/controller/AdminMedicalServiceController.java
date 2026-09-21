package com.medicompare.controller;

import com.medicompare.entity.HospitalService;
import com.medicompare.entity.MedicalService;
import com.medicompare.service.MedicalCatalogService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/admin/services")
@RequiredArgsConstructor
public class AdminMedicalServiceController {

    private final MedicalCatalogService medicalCatalogService;

    @GetMapping
    public List<MedicalService> list() {
        return medicalCatalogService.listServices();
    }

    @PostMapping
    public ResponseEntity<MedicalService> create(@RequestBody ServiceRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(medicalCatalogService.createService(request.getName(), request.getCategory(), request.getDescription()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        medicalCatalogService.deleteService(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{hospitalId}/price/{medicalServiceId}")
    public HospitalService setPrice(@PathVariable Long hospitalId, @PathVariable Long medicalServiceId,
                                     @RequestBody PriceRequest request) {
        return medicalCatalogService.setPrice(hospitalId, medicalServiceId, request.getPrice(), request.isAvailable());
    }

    @GetMapping("/prices/{hospitalId}")
    public List<HospitalService> pricesForHospital(@PathVariable Long hospitalId) {
        return medicalCatalogService.pricesForHospital(hospitalId);
    }

    @Data
    public static class ServiceRequest {
        private String name;
        private String category;
        private String description;
    }

    @Data
    public static class PriceRequest {
        private BigDecimal price;
        private boolean available = true;
    }
}
