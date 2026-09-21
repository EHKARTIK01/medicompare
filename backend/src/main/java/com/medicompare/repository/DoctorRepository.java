package com.medicompare.repository;

import com.medicompare.entity.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DoctorRepository extends JpaRepository<Doctor, Long> {
    List<Doctor> findByHospitalId(Long hospitalId);
    List<Doctor> findByHospitalIdAndSpecializationIgnoreCase(Long hospitalId, String specialization);
}
