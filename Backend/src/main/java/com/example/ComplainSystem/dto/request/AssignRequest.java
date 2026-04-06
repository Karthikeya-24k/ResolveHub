package com.example.ComplainSystem.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AssignRequest {
    @NotNull(message = "Issue ID must not be null")
    private Long issueId;

    @NotNull(message = "Staff ID must not be null")
    private Long staffId;

    @NotBlank(message = "Priority must not be empty")
    private String priority;
}