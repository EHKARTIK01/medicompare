package com.medicompare.config;

import com.medicompare.entity.Doctor;
import com.medicompare.entity.Role;
import com.medicompare.entity.User;
import com.medicompare.repository.AppointmentSlotRepository;
import com.medicompare.repository.DoctorRepository;
import com.medicompare.repository.UserRepository;
import com.medicompare.service.SlotService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

/**
 * Seeds a default admin account and a demo patient account on first startup,
 * using the real PasswordEncoder bean (never a hardcoded hash in SQL). Also
 * generates the next 7 days of appointment slots for every doctor that doesn't
 * already have upcoming slots, so the booking flow works immediately against
 * the demo dataset regardless of when the app is deployed.
 *
 * Demo credentials (change immediately in any non-local environment):
 *   Admin:   admin@medicompare.in   / Admin@123
 *   Patient: demo@medicompare.in    / Demo@123
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private static final int DAYS_AHEAD = 7;

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final DoctorRepository doctorRepository;
    private final AppointmentSlotRepository appointmentSlotRepository;
    private final SlotService slotService;

    @Override
    public void run(String... args) {
        seedAccounts();
        seedUpcomingSlots();
    }

    private void seedAccounts() {
        if (!userRepository.existsByEmail("admin@medicompare.in")) {
            userRepository.save(User.builder()
                    .fullName("MediCompare Admin")
                    .email("admin@medicompare.in")
                    .passwordHash(passwordEncoder.encode("Admin@123"))
                    .phone("+91-9000000000")
                    .role(Role.ROLE_ADMIN)
                    .enabled(true)
                    .build());
        }

        if (!userRepository.existsByEmail("demo@medicompare.in")) {
            userRepository.save(User.builder()
                    .fullName("Demo Patient")
                    .email("demo@medicompare.in")
                    .passwordHash(passwordEncoder.encode("Demo@123"))
                    .phone("+91-9111111111")
                    .role(Role.ROLE_USER)
                    .enabled(true)
                    .build());
        }
    }

    private void seedUpcomingSlots() {
        LocalDate today = LocalDate.now();
        int generatedForDoctors = 0;

        for (Doctor doctor : doctorRepository.findAll()) {
            if (appointmentSlotRepository.existsByDoctorIdAndSlotDateGreaterThanEqual(doctor.getId(), today)) {
                continue; // already has upcoming slots - don't duplicate
            }
            for (int i = 0; i < DAYS_AHEAD; i++) {
                slotService.generateDaySlots(doctor.getId(), today.plusDays(i));
            }
            generatedForDoctors++;
        }

        if (generatedForDoctors > 0) {
            log.info("Generated {} days of appointment slots for {} doctor(s) with no upcoming availability.",
                    DAYS_AHEAD, generatedForDoctors);
        }
    }
}

