package com.medicompare.repository;

import com.medicompare.entity.Appointment;
import com.medicompare.entity.AppointmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    List<Appointment> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<Appointment> findByHospitalIdOrderByCreatedAtDesc(Long hospitalId);
    List<Appointment> findByStatus(AppointmentStatus status);
}
