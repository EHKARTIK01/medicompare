package com.medicompare.controller;

import com.medicompare.entity.Doctor;
import com.medicompare.entity.Hospital;
import com.medicompare.exception.ResourceNotFoundException;
import com.medicompare.repository.DoctorRepository;
import com.medicompare.repository.HospitalRepository;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/doctors")
@RequiredArgsConstructor
public class AdminDoctorController {

    private final DoctorRepository doctorRepository;
    private final HospitalRepository hospitalRepository;

    @GetMapping
    public List<Doctor> list(@RequestParam(required = false) Long hospitalId) {
        return hospitalId != null ? doctorRepository.findByHospitalId(hospitalId) : doctorRepository.findAll();
    }

    @PostMapping
    public ResponseEntity<Doctor> create(@RequestBody DoctorRequest request) {
        Hospital hospital = hospitalRepository.findById(request.getHospitalId())
                .orElseThrow(() -> new ResourceNotFoundException("Hospital not found"));
        Doctor doctor = Doctor.builder()
                .hospital(hospital)
                .name(request.getName())
                .specialization(request.getSpecialization())
                .qualification(request.getQualification())
                .experienceYears(request.getExperienceYears())
                .rating(request.getRating() != null ? request.getRating() : 0.0)
                .build();
        return ResponseEntity.status(HttpStatus.CREATED).body(doctorRepository.save(doctor));
    }

    @PutMapping("/{id}")
    public Doctor update(@PathVariable Long id, @RequestBody DoctorRequest request) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));
        doctor.setName(request.getName());
        doctor.setSpecialization(request.getSpecialization());
        doctor.setQualification(request.getQualification());
        doctor.setExperienceYears(request.getExperienceYears());
        if (request.getRating() != null) doctor.setRating(request.getRating());
        return doctorRepository.save(doctor);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!doctorRepository.existsById(id)) {
            throw new ResourceNotFoundException("Doctor not found");
        }
        doctorRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @Data
    public static class DoctorRequest {
        @NotNull private Long hospitalId;
        @NotBlank private String name;
        @NotBlank private String specialization;
        private String qualification;
        private Integer experienceYears = 0;
        private Double rating;
    }
}
