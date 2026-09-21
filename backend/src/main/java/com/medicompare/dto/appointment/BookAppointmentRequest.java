package com.medicompare.dto.appointment;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class BookAppointmentRequest {
    @NotNull private Long hospitalId;
    @NotNull private Long medicalServiceId;
    private Long doctorId;      // optional
    @NotNull private Long slotId;

    @NotBlank private String patientName;
    @NotBlank private String patientPhone;
    private String patientAge;
    private String notes;
}
