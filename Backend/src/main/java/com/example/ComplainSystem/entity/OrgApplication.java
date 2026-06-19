package com.example.ComplainSystem.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "org_applications")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrgApplication {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String organizationName;

    private String organizationType; // Company, College, Society, Clinic, Other

    @Column(nullable = false)
    private String adminName;

    @Column(nullable = false)
    private String adminEmail;

    private String phone;

    private Integer approxUsers;

    @Column(length = 1000)
    private String message;

    @Column(nullable = false)
    @Builder.Default
    private String status = "PENDING"; // PENDING, APPROVED, REJECTED

    @Column(length = 1000)
    private String rejectionReason;

    @Column(nullable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
