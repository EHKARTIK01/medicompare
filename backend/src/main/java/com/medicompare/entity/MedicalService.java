package com.medicompare.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "medical_services")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MedicalService {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 150)
    private String name; // e.g. "MRI Scan"

    @Column(nullable = false, length = 80)
    private String category; // e.g. "Radiology", "Consultation", "Pathology"

    @Column(length = 1000)
    private String description;
}
