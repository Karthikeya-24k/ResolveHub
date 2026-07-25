package com.example.ComplainSystem.controller;

import com.example.ComplainSystem.dto.response.AttachmentResponse;
import com.example.ComplainSystem.services.FileUploadService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/attachments")
public class AttachmentController {

    private final FileUploadService fileUploadService;

    public AttachmentController(FileUploadService fileUploadService) {
        this.fileUploadService = fileUploadService;
    }

    @GetMapping("/issue/{issueId}")
    public List<AttachmentResponse> getByIssue(@PathVariable Long issueId) {
        return fileUploadService.getByIssue(issueId);
    }

    @GetMapping("/comment/{commentId}")
    public List<AttachmentResponse> getByComment(@PathVariable Long commentId) {
        return fileUploadService.getByComment(commentId);
    }
}
