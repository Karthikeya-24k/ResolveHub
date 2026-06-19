package com.example.ComplainSystem.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class PublicComplaintRequest {

    @NotBlank(message = "Title must not be empty")
    private String title;

    @NotBlank(message = "Description must not be empty")
    private String description;

    /** Submitter name — shown as Anonymous if anonymous=true */
    private String submitterName;

    @Email(message = "Email must be valid")
    private String submitterEmail;

    private boolean anonymous = false;
}
