package com.medicompare.service;

import com.medicompare.dto.appointment.AppointmentResponse;
import com.medicompare.dto.appointment.BookAppointmentRequest;
import com.medicompare.entity.*;
import com.medicompare.exception.BadRequestException;
import com.medicompare.exception.ConflictException;
import com.medicompare.exception.ResourceNotFoundException;
import com.medicompare.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AppointmentBookingService {

    private final AppointmentRepository appointmentRepository;
    private final AppointmentSlotRepository slotRepository;
    private final HospitalRepository hospitalRepository;
    private final MedicalServiceRepository medicalServiceRepository;
    private final DoctorRepository doctorRepository;
    private final UserRepository userRepository;
    private final PaymentRepository paymentRepository;
    private final EmailNotificationService emailNotificationService;
    private final HospitalServiceRepository hospitalServiceRepository;

    /**
     * Books an appointment. Uses a pessimistic write lock on the slot row to
     * guarantee two users can never book the same slot (prevents double booking).
     */
    @Transactional
    public AppointmentResponse book(Long userId, BookAppointmentRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Hospital hospital = hospitalRepository.findById(request.getHospitalId())
                .orElseThrow(() -> new ResourceNotFoundException("Hospital not found"));
        MedicalService service = medicalServiceRepository.findById(request.getMedicalServiceId())
                .orElseThrow(() -> new ResourceNotFoundException("Medical service not found"));

        AppointmentSlot slot = slotRepository.findByIdForUpdate(request.getSlotId())
                .orElseThrow(() -> new ResourceNotFoundException("Slot not found"));

        if (slot.isBooked()) {
            throw new ConflictException("This slot has just been booked by someone else. Please choose another slot.");
        }

        Doctor doctor = null;
        if (request.getDoctorId() != null) {
            doctor = doctorRepository.findById(request.getDoctorId())
                    .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));
        }

        slot.setBooked(true);
        slotRepository.save(slot);

        Appointment appointment = Appointment.builder()
                .user(user)
                .hospital(hospital)
                .medicalService(service)
                .doctor(doctor)
                .slot(slot)
                .patientName(request.getPatientName())
                .patientPhone(request.getPatientPhone())
                .patientAge(request.getPatientAge())
                .notes(request.getNotes())
                .status(AppointmentStatus.PENDING)
                .build();

        appointment = appointmentRepository.save(appointment);
        return toResponse(appointment);
    }

    public List<AppointmentResponse> myAppointments(Long userId) {
        return appointmentRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream().map(this::toResponse).toList();
    }

    /** Admin: list all appointments, optionally filtered by status. */
    public List<AppointmentResponse> listAll(AppointmentStatus status) {
        List<Appointment> appointments = status != null
                ? appointmentRepository.findByStatus(status)
                : appointmentRepository.findAll();
        return appointments.stream()
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .map(this::toResponse)
                .toList();
    }

    public AppointmentResponse getById(Long appointmentId) {
        return toResponse(findAppointment(appointmentId));
    }

    @Transactional
    public AppointmentResponse cancel(Long userId, Long appointmentId) {
        Appointment appointment = findAppointment(appointmentId);
        if (!appointment.getUser().getId().equals(userId)) {
            throw new BadRequestException("You can only cancel your own appointments");
        }
        if (appointment.getStatus() == AppointmentStatus.COMPLETED) {
            throw new BadRequestException("Completed appointments cannot be cancelled");
        }
        if (appointment.getStatus() == AppointmentStatus.CANCELLED) {
            throw new BadRequestException("This appointment is already cancelled");
        }
        appointment.setStatus(AppointmentStatus.CANCELLED);
        if (appointment.getSlot() != null) {
            appointment.getSlot().setBooked(false);
            slotRepository.save(appointment.getSlot());
        }
        AppointmentResponse response = toResponse(appointmentRepository.save(appointment));
        emailNotificationService.sendAppointmentCancellation(
                appointment.getUser().getEmail(),
                appointment.getPatientName(),
                appointment.getHospital().getName(),
                appointment.getMedicalService().getName()
        );
        return response;
    }

    @Transactional
    public void markConfirmed(Long appointmentId) {
        Appointment appointment = findAppointment(appointmentId);
        appointment.setStatus(AppointmentStatus.CONFIRMED);
        appointmentRepository.save(appointment);
    }

    /** Admin cancellation — bypasses the "own appointment" ownership check that applies to patients. */
    @Transactional
    public AppointmentResponse adminCancel(Long appointmentId) {
        Appointment appointment = findAppointment(appointmentId);
        if (appointment.getStatus() == AppointmentStatus.COMPLETED) {
            throw new BadRequestException("Completed appointments cannot be cancelled");
        }
        if (appointment.getStatus() == AppointmentStatus.CANCELLED) {
            throw new BadRequestException("This appointment is already cancelled");
        }
        appointment.setStatus(AppointmentStatus.CANCELLED);
        if (appointment.getSlot() != null) {
            appointment.getSlot().setBooked(false);
            slotRepository.save(appointment.getSlot());
        }
        AppointmentResponse response = toResponse(appointmentRepository.save(appointment));
        emailNotificationService.sendAppointmentCancellation(
                appointment.getUser().getEmail(),
                appointment.getPatientName(),
                appointment.getHospital().getName(),
                appointment.getMedicalService().getName()
        );
        return response;
    }

    private Appointment findAppointment(Long id) {
        return appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with id: " + id));
    }

    private AppointmentResponse toResponse(Appointment a) {
        String paymentStatus = paymentRepository.findByAppointmentId(a.getId())
                .map(p -> p.getStatus().name())
                .orElse("NOT_INITIATED");

        java.math.BigDecimal price = hospitalServiceRepository
                .findByHospitalIdAndMedicalServiceId(a.getHospital().getId(), a.getMedicalService().getId())
                .map(com.medicompare.entity.HospitalService::getPrice)
                .orElse(java.math.BigDecimal.ZERO);

        return AppointmentResponse.builder()
                .id(a.getId())
                .hospitalName(a.getHospital().getName())
                .serviceName(a.getMedicalService().getName())
                .doctorName(a.getDoctor() != null ? a.getDoctor().getName() : null)
                .slotDate(a.getSlot() != null ? a.getSlot().getSlotDate() : null)
                .slotTime(a.getSlot() != null ? a.getSlot().getSlotTime() : null)
                .patientName(a.getPatientName())
                .status(a.getStatus().name())
                .price(price)
                .paymentStatus(paymentStatus)
                .build();
    }
}
