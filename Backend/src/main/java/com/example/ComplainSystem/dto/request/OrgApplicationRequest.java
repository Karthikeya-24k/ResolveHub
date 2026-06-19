package com.example.ComplainSystem.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class OrgApplicationRequest {

    @NotBlank(message = "Organization name must not be empty")
    private String organizationName;

    private String organizationType;

    @NotBlank(message = "Admin name must not be empty")
    private String adminName;

    @NotBlank(message = "Admin email must not be empty")
    @Email(message = "Admin email must be valid")
    private String adminEmail;

    private String phone;

    private Integer approxUsers;

    private String message;
}
