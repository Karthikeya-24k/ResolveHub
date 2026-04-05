package com.example.ComplainSystem.services;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.ComplainSystem.dto.request.CommentRequest;
import com.example.ComplainSystem.dto.response.CommentResponse;
import com.example.ComplainSystem.entity.Comment;
import com.example.ComplainSystem.entity.IssuesEntity;
import com.example.ComplainSystem.entity.User;
import com.example.ComplainSystem.repository.CommentRepository;
import com.example.ComplainSystem.repository.IssueRepo;
import com.example.ComplainSystem.repository.UserRepo;

import java.util.List;

@Service
public class CommentService {

    private final CommentRepository commentRepository;
    private final IssueRepo issueRepository;
    private final UserRepo userRepository;

    public CommentService(CommentRepository commentRepository,
                          IssueRepo issueRepository,
                          UserRepo userRepository) {
        this.commentRepository = commentRepository;
        this.issueRepository = issueRepository;
        this.userRepository = userRepository;
    }

    public CommentResponse addComment(CommentRequest request, String email) {

        IssuesEntity issue = issueRepository.findById(request.getIssueId())
                .orElseThrow(() -> new RuntimeException("Issue not found"));

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Comment comment = Comment.builder()
                .message(request.getMessage())
                .issue(issue)
                .user(user)
                .build();

        Comment saved = commentRepository.save(comment);

        return new CommentResponse(
                saved.getId(),
                saved.getMessage(),
                saved.getUser().getName()
        );
    }

    @Transactional(readOnly = true)
    public List<CommentResponse> getCommentsByIssue(Long issueId) {
        return commentRepository.findByIssue_Id(issueId)
                .stream()
                .map(c -> new CommentResponse(c.getId(), c.getMessage(), c.getUser().getName()))
                .toList();
    }
}