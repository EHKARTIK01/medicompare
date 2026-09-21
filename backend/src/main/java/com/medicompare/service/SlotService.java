package com.medicompare.service;

import com.medicompare.entity.AppointmentSlot;
import com.medicompare.entity.Doctor;
import com.medicompare.entity.Hospital;
import com.medicompare.exception.ResourceNotFoundException;
import com.medicompare.repository.AppointmentSlotRepository;
import com.medicompare.repository.DoctorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SlotService {

    private final AppointmentSlotRepository slotRepository;
    private final DoctorRepository doctorRepository;

    public List<AppointmentSlot> availableSlots(Long doctorId, LocalDate date) {
        return slotRepository.findByDoctorIdAndSlotDateAndBookedFalse(doctorId, date);
    }

    /** Generates half-hour slots between 09:00-13:00 and 16:00-20:00 for a doctor on a date (admin/demo utility). */
    @Transactional
    public List<AppointmentSlot> generateDaySlots(Long doctorId, LocalDate date) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));
        Hospital hospital = doctor.getHospital();

        List<AppointmentSlot> created = new java.util.ArrayList<>();
        created.addAll(buildRange(doctor, hospital, date, LocalTime.of(9, 0), LocalTime.of(13, 0)));
        created.addAll(buildRange(doctor, hospital, date, LocalTime.of(16, 0), LocalTime.of(20, 0)));
        return slotRepository.saveAll(created);
    }

    private List<AppointmentSlot> buildRange(Doctor doctor, Hospital hospital, LocalDate date, LocalTime start, LocalTime end) {
        List<AppointmentSlot> slots = new java.util.ArrayList<>();
        LocalTime t = start;
        while (t.isBefore(end)) {
            slots.add(AppointmentSlot.builder()
                    .doctor(doctor).hospital(hospital)
                    .slotDate(date).slotTime(t).booked(false).build());
            t = t.plusMinutes(30);
        }
        return slots;
    }
}
