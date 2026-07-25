package com.example.ComplainSystem.controller;

import com.example.ComplainSystem.dto.request.CommentRequest;
import com.example.ComplainSystem.dto.response.CommentResponse;
import com.example.ComplainSystem.services.CommentService;
import jakarta.validation.Valid;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/comments")
public class CommentController {

    private final CommentService commentService;

    public CommentController(CommentService commentService) {
        this.commentService = commentService;
    }

    @PostMapping(consumes = { MediaType.MULTIPART_FORM_DATA_VALUE, MediaType.APPLICATION_JSON_VALUE })
    public CommentResponse addComment(
            @RequestPart("data") @Valid CommentRequest request,
            @RequestPart(value = "files", required = false) List<MultipartFile> files,
            Authentication auth) {
        return commentService.addComment(request, files, auth.getName());
    }

    @GetMapping("/issue/{issueId}")
    public List<CommentResponse> getCommentsByIssue(@PathVariable Long issueId) {
        return commentService.getCommentsByIssue(issueId);
    }
}