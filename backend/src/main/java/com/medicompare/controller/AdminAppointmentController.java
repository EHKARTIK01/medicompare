package com.medicompare.controller;

import com.medicompare.dto.appointment.AppointmentResponse;
import com.medicompare.entity.AppointmentStatus;
import com.medicompare.service.AppointmentBookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/appointments")
@RequiredArgsConstructor
public class AdminAppointmentController {

    private final AppointmentBookingService appointmentBookingService;

    /** Lists all appointments, optionally filtered by status (PENDING, CONFIRMED, CANCELLED, COMPLETED). */
    @GetMapping
    public List<AppointmentResponse> listAll(@RequestParam(required = false) AppointmentStatus status) {
        return appointmentBookingService.listAll(status);
    }

    @GetMapping("/{id}")
    public AppointmentResponse getById(@PathVariable Long id) {
        return appointmentBookingService.getById(id);
    }

    @PostMapping("/{id}/confirm")
    public AppointmentResponse confirm(@PathVariable Long id) {
        appointmentBookingService.markConfirmed(id);
        return appointmentBookingService.getById(id);
    }

    @PostMapping("/{id}/cancel")
    public AppointmentResponse cancel(@PathVariable Long id) {
        return appointmentBookingService.adminCancel(id);
    }
}
