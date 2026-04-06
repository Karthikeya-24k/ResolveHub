package com.example.ComplainSystem.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class IssueRequest {
    @NotBlank(message = "Title must not be empty")
    private String title;

    @NotBlank(message = "Description must not be empty")
    private String description;
}