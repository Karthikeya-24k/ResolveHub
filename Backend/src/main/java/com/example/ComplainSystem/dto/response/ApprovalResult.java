package com.example.ComplainSystem.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ApprovalResult {
    private String adminEmail;
    private String temporaryPassword;
    private String organizationName;
    private String organizationSlug;
    private String apiKey;
}
