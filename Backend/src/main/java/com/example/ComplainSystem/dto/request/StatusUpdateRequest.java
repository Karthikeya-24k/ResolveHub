package com.example.ComplainSystem.dto.request;

import lombok.Data;

@Data
public class StatusUpdateRequest {
    private Long issueId;
    private String status;
}
