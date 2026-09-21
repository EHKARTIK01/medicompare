package com.medicompare.repository;

import com.medicompare.entity.MedicalService;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface MedicalServiceRepository extends JpaRepository<MedicalService, Long> {
    Optional<MedicalService> findByNameIgnoreCase(String name);
    List<MedicalService> findByCategoryIgnoreCase(String category);
}
