package com.medicompare.controller;

import com.medicompare.dto.hospital.HospitalResponse;
import com.medicompare.dto.hospital.HospitalUpsertRequest;
import com.medicompare.service.HospitalCatalogService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/hospitals")
@RequiredArgsConstructor
public class AdminHospitalController {

    private final HospitalCatalogService hospitalCatalogService;

    @PostMapping
    public ResponseEntity<HospitalResponse> create(@Valid @RequestBody HospitalUpsertRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(hospitalCatalogService.create(request));
    }

    @PutMapping("/{id}")
    public HospitalResponse update(@PathVariable Long id, @Valid @RequestBody HospitalUpsertRequest request) {
        return hospitalCatalogService.update(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        hospitalCatalogService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
