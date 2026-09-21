package com.medicompare.repository;

import com.medicompare.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Payment> findByAppointmentId(Long appointmentId);
    Optional<Payment> findByRazorpayOrderId(String orderId);
    List<Payment> findByAppointment_User_IdOrderByCreatedAtDesc(Long userId);
}
