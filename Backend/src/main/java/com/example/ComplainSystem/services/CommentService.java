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
    private final NotificationService notificationService;
    private final EmailService emailService;

    public CommentService(CommentRepository commentRepository,
                          IssueRepo issueRepository,
                          UserRepo userRepository,
                          NotificationService notificationService,
                          EmailService emailService) {
        this.commentRepository   = commentRepository;
        this.issueRepository     = issueRepository;
        this.userRepository      = userRepository;
        this.notificationService = notificationService;
        this.emailService        = emailService;
    }

    @Transactional
    public CommentResponse addComment(CommentRequest request, String email) {
        IssuesEntity issue = issueRepository.findById(request.getIssueId())
                .orElseThrow(() -> new RuntimeException("Issue not found"));

        User commenter = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Comment comment = Comment.builder()
                .message(request.getMessage())
                .issue(issue)
                .user(commenter)
                .build();

        Comment saved = commentRepository.save(comment);

        // In-app notifications
        notificationService.notifyOnComment(issue, commenter);

        // Email the issue creator if staff or admin commented
        // (so they know someone responded — especially useful for public portal users)
        boolean commenterIsStaffOrAdmin =
                "STAFF".equals(commenter.getRole()) || "ADMIN".equals(commenter.getRole());

        if (commenterIsStaffOrAdmin) {
            // Find the real recipient — handle anonymous issues
            User recipient = null;
            if (issue.isAnonymous() && issue.getRealCreatorId() != null) {
                recipient = userRepository.findById(issue.getRealCreatorId()).orElse(null);
            } else if (issue.getCreatedBy() != null) {
                recipient = issue.getCreatedBy();
            }

            if (recipient != null
                    && recipient.getEmail() != null
                    && !recipient.getEmail().isBlank()
                    && !recipient.getId().equals(commenter.getId())) {
                emailService.sendCommentNotification(
                        recipient.getEmail(),
                        recipient.getName(),
                        commenter.getName(),
                        issue.getTicketNumber() != null ? issue.getTicketNumber() : "#" + issue.getId(),
                        issue.getTitle(),
                        request.getMessage(),
                        issue.getId()
                );
            }
        }

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
