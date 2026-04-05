package com.example.ComplainSystem.dto.request;

import lombok.Data;

@Data
public class AssignRequest {
    private Long issueId;
    private Long staffId;
    private String priority;
}
