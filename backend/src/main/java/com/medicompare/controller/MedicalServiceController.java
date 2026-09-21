package com.medicompare.controller;

import com.medicompare.entity.MedicalService;
import com.medicompare.service.MedicalCatalogService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/services")
@RequiredArgsConstructor
public class MedicalServiceController {

    private final MedicalCatalogService medicalCatalogService;

    @GetMapping
    public List<MedicalService> list() {
        return medicalCatalogService.listServices();
    }
}
