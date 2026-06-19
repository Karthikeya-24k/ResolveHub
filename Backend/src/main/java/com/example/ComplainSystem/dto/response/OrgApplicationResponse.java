package com.example.ComplainSystem.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class OrgApplicationResponse {
    private Long id;
    private String organizationName;
    private String organizationType;
    private String adminName;
    private String adminEmail;
    private String phone;
    private Integer approxUsers;
    private String message;
    private String status;
    private String rejectionReason;
    private LocalDateTime createdAt;
}
