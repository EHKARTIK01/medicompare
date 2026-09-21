package com.medicompare.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

/**
 * Sends transactional emails (booking confirmation, cancellation, payment receipt).
 *
 * If MAIL_HOST is not configured, this falls back to logging the email content
 * instead of sending it — the same "mock mode" pattern used for payments, so the
 * whole appointment flow works out of the box without requiring SMTP credentials.
 */
@Service
@Slf4j
public class EmailNotificationService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.host:}")
    private String mailHost;

    @Value("${app.mail.from:no-reply@medicompare.demo}")
    private String fromAddress;

    public EmailNotificationService(org.springframework.beans.factory.ObjectProvider<JavaMailSender> mailSenderProvider) {
        this.mailSender = mailSenderProvider.getIfAvailable();
    }

    public void sendAppointmentConfirmation(String toEmail, String patientName, String hospitalName,
                                             String serviceName, String date, String time) {
        String subject = "MediCompare — Appointment confirmed";
        String body = String.format(
                "Hi %s,%n%nYour appointment for %s at %s is confirmed for %s at %s.%n%n" +
                "Thank you for using MediCompare.",
                patientName, serviceName, hospitalName, date, time);
        send(toEmail, subject, body);
    }

    public void sendAppointmentCancellation(String toEmail, String patientName, String hospitalName, String serviceName) {
        String subject = "MediCompare — Appointment cancelled";
        String body = String.format(
                "Hi %s,%n%nYour appointment for %s at %s has been cancelled as requested.%n%n" +
                "You can book a new appointment anytime from your MediCompare dashboard.",
                patientName, serviceName, hospitalName);
        send(toEmail, subject, body);
    }

    private void send(String to, String subject, String body) {
        boolean mockMode = mailSender == null || mailHost == null || mailHost.isBlank();
        if (mockMode) {
            log.info("[MOCK EMAIL] To: {} | Subject: {} | Body: {}", to, subject, body.replace("\n", " "));
            return;
        }
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromAddress);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
        } catch (Exception e) {
            log.warn("Failed to send email to {}: {}", to, e.getMessage());
        }
    }
}
