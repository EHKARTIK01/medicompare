package com.medicompare.controller;

import com.medicompare.dto.appointment.AppointmentResponse;
import com.medicompare.dto.appointment.BookAppointmentRequest;
import com.medicompare.security.UserPrincipal;
import com.medicompare.service.AppointmentBookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
public class AppointmentController {

    private final AppointmentBookingService appointmentBookingService;

    @PostMapping
    public ResponseEntity<AppointmentResponse> book(@AuthenticationPrincipal UserPrincipal principal,
                                                      @Valid @RequestBody BookAppointmentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(appointmentBookingService.book(principal.getId(), request));
    }

    @GetMapping("/me")
    public List<AppointmentResponse> myAppointments(@AuthenticationPrincipal UserPrincipal principal) {
        return appointmentBookingService.myAppointments(principal.getId());
    }

    @GetMapping("/{id}")
    public AppointmentResponse getById(@PathVariable Long id) {
        return appointmentBookingService.getById(id);
    }

    @PostMapping("/{id}/cancel")
    public AppointmentResponse cancel(@AuthenticationPrincipal UserPrincipal principal, @PathVariable Long id) {
        return appointmentBookingService.cancel(principal.getId(), id);
    }
}
