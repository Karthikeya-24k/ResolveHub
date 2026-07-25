package com.example.ComplainSystem.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AttachmentResponse {
    private Long id;
    private String url;
    private String originalName;
    private String fileType;
    private Long fileSize;
}
