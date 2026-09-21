package com.medicompare.dto.hospital;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class HospitalUpsertRequest {
    @NotBlank private String name;
    @NotBlank private String address;
    @NotBlank private String city;
    private String locality;
    @NotNull private Double latitude;
    @NotNull private Double longitude;
    private String phone;
    private String email;
    private String description;
    private String facilities;   // comma separated
    private String specialties;  // comma separated
    private String openingHours;
    private boolean available = true;
    private boolean verified = false;
}
