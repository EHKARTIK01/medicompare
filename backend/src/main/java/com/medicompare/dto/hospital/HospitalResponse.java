package com.medicompare.dto.hospital;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HospitalResponse {
    private Long id;
    private String name;
    private String address;
    private String city;
    private String locality;
    private Double latitude;
    private Double longitude;
    private Double rating;
    private Integer reviewCount;
    private String phone;
    private String email;
    private String description;
    private List<String> facilities;
    private List<String> specialties;
    private String openingHours;
    private boolean available;
    private boolean verified;
    private Double distanceKm; // populated only when user location is supplied
}
