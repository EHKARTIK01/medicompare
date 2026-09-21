package com.medicompare.service;

import com.medicompare.entity.HospitalService;
import com.medicompare.entity.MedicalService;
import com.medicompare.exception.ResourceNotFoundException;
import com.medicompare.repository.HospitalRepository;
import com.medicompare.repository.HospitalServiceRepository;
import com.medicompare.repository.MedicalServiceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

/** Manages the medical services catalog and per-hospital pricing (admin operations). */
@Service
@RequiredArgsConstructor
public class MedicalCatalogService {

    private final MedicalServiceRepository medicalServiceRepository;
    private final HospitalServiceRepository hospitalServiceRepository;
    private final HospitalRepository hospitalRepository;

    public List<MedicalService> listServices() {
        return medicalServiceRepository.findAll();
    }

    @Transactional
    public MedicalService createService(String name, String category, String description) {
        MedicalService service = MedicalService.builder()
                .name(name).category(category).description(description).build();
        return medicalServiceRepository.save(service);
    }

    @Transactional
    public void deleteService(Long id) {
        if (!medicalServiceRepository.existsById(id)) {
            throw new ResourceNotFoundException("Medical service not found");
        }
        medicalServiceRepository.deleteById(id);
    }

    @Transactional
    @CacheEvict(value = "priceComparison", allEntries = true)
    public HospitalService setPrice(Long hospitalId, Long medicalServiceId, BigDecimal price, boolean available) {
        var hospital = hospitalRepository.findById(hospitalId)
                .orElseThrow(() -> new ResourceNotFoundException("Hospital not found"));
        var service = medicalServiceRepository.findById(medicalServiceId)
                .orElseThrow(() -> new ResourceNotFoundException("Medical service not found"));

        HospitalService hs = hospitalServiceRepository.findByHospitalIdAndMedicalServiceId(hospitalId, medicalServiceId)
                .orElse(HospitalService.builder().hospital(hospital).medicalService(service).build());
        hs.setPrice(price);
        hs.setAvailable(available);
        return hospitalServiceRepository.save(hs);
    }

    public List<HospitalService> pricesForHospital(Long hospitalId) {
        return hospitalServiceRepository.findByHospitalId(hospitalId);
    }
}
