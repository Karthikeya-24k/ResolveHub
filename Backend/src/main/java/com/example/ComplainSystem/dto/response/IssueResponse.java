package com.example.ComplainSystem.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class IssueResponse {
    private Long id;
    private String title;
    private String description;
    private String status;
    private String priority;
    private List<CommentResponse> comments;
}
