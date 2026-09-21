package com.medicompare.controller;

import com.medicompare.entity.AppointmentSlot;
import com.medicompare.service.SlotService;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * Lets admins (re)generate bookable slots for a doctor. Useful because the demo
 * seed data's slots are dated relative to when data.sql was generated and will
 * eventually run out — this keeps the booking flow demonstrable indefinitely
 * without re-seeding the whole database.
 */
@RestController
@RequestMapping("/api/admin/slots")
@RequiredArgsConstructor
public class AdminSlotController {

    private final SlotService slotService;

    @PostMapping("/generate")
    public ResponseEntity<List<AppointmentSlot>> generate(@RequestBody GenerateSlotsRequest request) {
        List<AppointmentSlot> created = new ArrayList<>();
        long days = java.time.temporal.ChronoUnit.DAYS.between(request.getStartDate(), request.getEndDate());
        for (long i = 0; i <= days; i++) {
            LocalDate date = request.getStartDate().plusDays(i);
            created.addAll(slotService.generateDaySlots(request.getDoctorId(), date));
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @Data
    public static class GenerateSlotsRequest {
        @NotNull private Long doctorId;
        @NotNull private LocalDate startDate;
        @NotNull private LocalDate endDate;
    }
}
