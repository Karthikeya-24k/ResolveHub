package com.example.ComplainSystem.controller;

import com.example.ComplainSystem.dto.request.CommentRequest;
import com.example.ComplainSystem.dto.response.CommentResponse;
import com.example.ComplainSystem.services.CommentService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/comments")
public class CommentController {

    private final CommentService commentService;

    public CommentController(CommentService commentService) {
        this.commentService = commentService;
    }

    @PostMapping
    public CommentResponse addComment(@Valid @RequestBody CommentRequest request, Authentication auth) {
        return commentService.addComment(request, auth.getName());
    }

    @GetMapping("/issue/{issueId}")
    public List<CommentResponse> getCommentsByIssue(@PathVariable Long issueId) {
        return commentService.getCommentsByIssue(issueId);
    }
}