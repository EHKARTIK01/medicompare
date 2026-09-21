package com.medicompare.dto.appointment;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AppointmentResponse {
    private Long id;
    private String hospitalName;
    private String serviceName;
    private String doctorName;
    private LocalDate slotDate;
    private LocalTime slotTime;
    private String patientName;
    private String status;
    private BigDecimal price;
    private String paymentStatus;
}
