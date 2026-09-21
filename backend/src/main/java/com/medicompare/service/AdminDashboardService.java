package com.medicompare.service;

import com.medicompare.dto.admin.DashboardStatsResponse;
import com.medicompare.entity.AppointmentStatus;
import com.medicompare.entity.PaymentStatus;
import com.medicompare.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AdminDashboardService {

    private final HospitalRepository hospitalRepository;
    private final UserRepository userRepository;
    private final AppointmentRepository appointmentRepository;
    private final PaymentRepository paymentRepository;

    public DashboardStatsResponse getStats() {
        long totalAppointments = appointmentRepository.count();
        long pending = appointmentRepository.findByStatus(AppointmentStatus.PENDING).size();
        long confirmed = appointmentRepository.findByStatus(AppointmentStatus.CONFIRMED).size();
        long completed = appointmentRepository.findByStatus(AppointmentStatus.COMPLETED).size();
        long cancelled = appointmentRepository.findByStatus(AppointmentStatus.CANCELLED).size();

        double revenue = paymentRepository.findAll().stream()
                .filter(p -> p.getStatus() == PaymentStatus.PAID)
                .mapToDouble(p -> p.getAmount().doubleValue())
                .sum();

        return DashboardStatsResponse.builder()
                .totalHospitals(hospitalRepository.count())
                .totalUsers(userRepository.count())
                .totalAppointments(totalAppointments)
                .pendingAppointments(pending)
                .confirmedAppointments(confirmed)
                .completedAppointments(completed)
                .cancelledAppointments(cancelled)
                .totalRevenue(revenue)
                .build();
    }
}
