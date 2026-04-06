package com.example.ComplainSystem.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CommentRequest {
    @NotNull(message = "Issue ID must not be null")
    private Long issueId;

    @NotBlank(message = "Message must not be empty")
    private String message;
}