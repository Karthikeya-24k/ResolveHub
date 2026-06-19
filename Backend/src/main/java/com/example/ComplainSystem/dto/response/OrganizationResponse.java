package com.example.ComplainSystem.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class OrganizationResponse {
    private Long id;
    private String name;
    private String slug;
    private String contactEmail;
    private String status;
    private String apiKey;
    private LocalDateTime createdAt;
    // Assigned admin info
    private String adminName;
    private String adminEmail;
}
