package com.medicompare.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalTime;

/**
 * Represents a bookable slot for a doctor at a hospital on a given date/time.
 * Prevents double-booking via the unique constraint + isBooked flag guarded
 * with a pessimistic lock in the service layer.
 */
@Entity
@Table(name = "appointment_slots",
       uniqueConstraints = @UniqueConstraint(columnNames = {"doctor_id", "slot_date", "slot_time"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AppointmentSlot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "doctor_id", nullable = false)
    private Doctor doctor;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "hospital_id", nullable = false)
    private Hospital hospital;

    @Column(name = "slot_date", nullable = false)
    private LocalDate slotDate;

    @Column(name = "slot_time", nullable = false)
    private LocalTime slotTime;

    @Builder.Default
    private boolean booked = false;
}
