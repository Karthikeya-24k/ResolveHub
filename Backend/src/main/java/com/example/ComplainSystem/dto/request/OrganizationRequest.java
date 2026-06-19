package com.example.ComplainSystem.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class OrganizationRequest {

    @NotBlank(message = "Organization name must not be empty")
    private String name;

    @NotBlank(message = "Slug must not be empty")
    private String slug;

    private String contactEmail;
}
