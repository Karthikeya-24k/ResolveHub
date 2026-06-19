package com.example.ComplainSystem.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ChangePasswordRequest {

    @NotBlank(message = "Current password must not be empty")
    private String currentPassword;

    @NotBlank(message = "New password must not be empty")
    @Size(min = 6, message = "New password must be at least 6 characters")
    private String newPassword;
}
