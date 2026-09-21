package com.medicompare.controller;

import com.medicompare.entity.Doctor;
import com.medicompare.repository.DoctorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/hospitals/{hospitalId}/doctors")
@RequiredArgsConstructor
public class DoctorController {

    private final DoctorRepository doctorRepository;

    @GetMapping
    public List<Doctor> byHospital(@PathVariable Long hospitalId) {
        return doctorRepository.findByHospitalId(hospitalId);
    }
}
