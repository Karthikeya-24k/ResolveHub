package com.example.ComplainSystem.dto.request;

import lombok.Data;

@Data
public class CommentRequest {

    private Long issueId;
    private String message;
}