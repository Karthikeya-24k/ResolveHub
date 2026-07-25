package com.example.ComplainSystem.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CommentResponse {
    private Long id;
    private String message;
    private String userName;
    private List<AttachmentResponse> attachments;

    public CommentResponse(Long id, String message, String userName) {
        this.id = id;
        this.message = message;
        this.userName = userName;
    }
}