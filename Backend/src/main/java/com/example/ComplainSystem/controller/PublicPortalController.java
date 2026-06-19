package com.example.ComplainSystem.controller;

import com.example.ComplainSystem.dto.request.PublicComplaintRequest;
import com.example.ComplainSystem.dto.response.ApiResponse;
import com.example.ComplainSystem.entity.IssuesEntity;
import com.example.ComplainSystem.entity.Organization;
import com.example.ComplainSystem.entity.Status;
import com.example.ComplainSystem.entity.User;
import com.example.ComplainSystem.repository.CommentRepository;
import com.example.ComplainSystem.repository.IssueRepo;
import com.example.ComplainSystem.repository.OrganizationRepository;
import com.example.ComplainSystem.repository.UserRepo;
import com.example.ComplainSystem.services.EmailService;
import com.example.ComplainSystem.services.NotificationService;
import jakarta.validation.Valid;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/public")
public class PublicPortalController {

    private final OrganizationRepository orgRepository;
    private final IssueRepo issueRepository;
    private final UserRepo userRepository;
    private final CommentRepository commentRepository;
    private final EmailService emailService;
    private final NotificationService notificationService;

    public PublicPortalController(OrganizationRepository orgRepository,
                                   IssueRepo issueRepository,
                                   UserRepo userRepository,
                                   CommentRepository commentRepository,
                                   EmailService emailService,
                                   NotificationService notificationService) {
        this.orgRepository       = orgRepository;
        this.issueRepository     = issueRepository;
        this.userRepository      = userRepository;
        this.commentRepository   = commentRepository;
        this.emailService        = emailService;
        this.notificationService = notificationService;
    }

    /** Returns basic org info for the public portal page */
    @GetMapping("/org/{slug}")
    public ApiResponse<Map<String, String>> getOrgInfo(@PathVariable String slug) {
        Organization org = orgRepository.findBySlug(slug)
                .orElseThrow(() -> new RuntimeException("Organization not found"));
        if (!"ACTIVE".equals(org.getStatus()))
            throw new RuntimeException("This organization's portal is currently inactive");
        return new ApiResponse<>("success", Map.of(
                "name",         org.getName(),
                "slug",         org.getSlug(),
                "contactEmail", org.getContactEmail() != null ? org.getContactEmail() : ""
        ));
    }

    /** Public complaint submission — no login required */
    @PostMapping("/org/{slug}/complaints")
    public ApiResponse<Map<String, String>> submitPublicComplaint(
            @PathVariable String slug,
            @Valid @RequestBody PublicComplaintRequest request) {

        Organization org = orgRepository.findBySlug(slug)
                .orElseThrow(() -> new RuntimeException("Organization not found"));
        if (!"ACTIVE".equals(org.getStatus()))
            throw new RuntimeException("This organization's portal is currently inactive");

        // For anonymous submissions: save the user only for internal tracking (magic link/reopen/email),
        // but do NOT link them as createdBy — that would expose their identity to admins.
        User submitter = null;
        if (request.getSubmitterEmail() != null && !request.getSubmitterEmail().isBlank()) {
            submitter = userRepository.findByEmail(request.getSubmitterEmail())
                    .orElseGet(() -> userRepository.save(User.builder()
                            .name(request.isAnonymous() ? "Anonymous"
                                    : (request.getSubmitterName() != null ? request.getSubmitterName() : "Guest"))
                            .email(request.getSubmitterEmail())
                            .password("")
                            .role("USER")
                            .organizationId(org.getId())
                            .build()));
        }

        long count = issueRepository.count();
        String ticketNumber  = "RH-" + (1000 + count + 1);
        String trackingToken = UUID.randomUUID().toString().replace("-", "");

        // anonymous=true: createdBy is null so admin never sees who submitted;
        //                 realCreatorId holds the user id for internal use only.
        IssuesEntity issue = IssuesEntity.builder()
                .ticketNumber(ticketNumber)
                .title(request.getTitle().trim())
                .description(request.getDescription().trim())
                .priority("LOW")
                .status(Status.OPEN)
                .createdBy(request.isAnonymous() ? null : submitter)
                .organizationId(org.getId())
                .anonymous(request.isAnonymous())
                .realCreatorId(submitter != null ? submitter.getId() : null)
                .trackingToken(trackingToken)
                .build();

        IssuesEntity saved = issueRepository.save(issue);

        boolean emailSent = false;
        if (request.getSubmitterEmail() != null && !request.getSubmitterEmail().isBlank()) {
            String recipientName = request.isAnonymous() ? "there"
                    : (request.getSubmitterName() != null && !request.getSubmitterName().isBlank()
                        ? request.getSubmitterName() : "there");
            emailService.sendMagicTrackingLink(
                    request.getSubmitterEmail(),
                    recipientName,
                    saved.getTicketNumber(),
                    saved.getTitle(),
                    org.getName(),
                    trackingToken
            );
            emailSent = true;
        }

        return new ApiResponse<>("success", Map.of(
                "ticketNumber", saved.getTicketNumber(),
                "emailSent",    String.valueOf(emailSent),
                "message",      "Your complaint has been submitted. Ticket: " + saved.getTicketNumber()
        ));
    }

    /** Public tracking — returns status + all comments */
    @GetMapping("/track/{ticketNumber}")
    @Transactional(readOnly = true)
    public ApiResponse<Map<String, Object>> trackComplaint(
            @PathVariable String ticketNumber,
            @RequestParam String token) {

        IssuesEntity issue = issueRepository.findByTicketNumber(ticketNumber)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
        if (!token.equals(issue.getTrackingToken()))
            throw new RuntimeException("Invalid tracking token");

        List<Map<String, String>> commentList = commentRepository.findByIssue_Id(issue.getId())
                .stream()
                .map(c -> Map.of(
                        "author",  c.getUser().getName(),
                        "role",    c.getUser().getRole(),
                        "message", c.getMessage()
                ))
                .toList();

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("ticketNumber", issue.getTicketNumber());
        result.put("title",        issue.getTitle());
        result.put("status",       issue.getStatus().name());
        result.put("priority",     issue.getPriority() != null ? issue.getPriority() : "LOW");
        result.put("anonymous",    String.valueOf(issue.isAnonymous()));
        result.put("resolvedAt",   issue.getResolvedAt() != null ? issue.getResolvedAt().toString() : null);
        result.put("reopenedAt",   issue.getReopenedAt() != null ? issue.getReopenedAt().toString() : null);
        result.put("comments",     commentList);

        return new ApiResponse<>("success", result);
    }

    /**
     * Public reply — submitter replies using their tracking token.
     * No login required. Token acts as proof of ownership.
     */
    @PostMapping("/track/{ticketNumber}/reply")
    @Transactional
    public ApiResponse<Map<String, String>> publicReply(
            @PathVariable String ticketNumber,
            @RequestParam String token,
            @RequestBody Map<String, String> body) {

        IssuesEntity issue = issueRepository.findByTicketNumber(ticketNumber)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
        if (!token.equals(issue.getTrackingToken()))
            throw new RuntimeException("Invalid tracking token");

        String message = body.get("message");
        if (message == null || message.isBlank())
            throw new RuntimeException("Message must not be empty");

        // Identify the submitter
        User commenter = null;
        if (issue.getCreatedBy() != null) {
            commenter = issue.getCreatedBy();
        } else if (issue.getRealCreatorId() != null) {
            commenter = userRepository.findById(issue.getRealCreatorId()).orElse(null);
        }
        if (commenter == null)
            throw new RuntimeException("Cannot identify the original submitter");

        com.example.ComplainSystem.entity.Comment comment =
                com.example.ComplainSystem.entity.Comment.builder()
                        .message(message.trim())
                        .issue(issue)
                        .user(commenter)
                        .build();
        commentRepository.save(comment);

        // In-app notification to staff + admin
        notificationService.notifyOnComment(issue, commenter);

        // Email the assigned staff member
        if (issue.getAssignedTo() != null
                && issue.getAssignedTo().getEmail() != null
                && !issue.getAssignedTo().getEmail().isBlank()) {
            emailService.sendCommentNotification(
                    issue.getAssignedTo().getEmail(),
                    issue.getAssignedTo().getName(),
                    commenter.getName(),
                    issue.getTicketNumber(),
                    issue.getTitle(),
                    message.trim(),
                    issue.getId()
            );
        }

        return new ApiResponse<>("success", Map.of("message", "Reply posted successfully"));
    }

    /**
     * Reopen endpoint — moves RESOLVED back to IN_PROGRESS within 48h window.
     * No login required. Token acts as proof of ownership.
     */
    @PostMapping("/track/{ticketNumber}/reopen")
    @Transactional
    public ApiResponse<Map<String, String>> reopenComplaint(
            @PathVariable String ticketNumber,
            @RequestParam String token,
            @RequestBody(required = false) Map<String, String> body) {

        IssuesEntity issue = issueRepository.findByTicketNumber(ticketNumber)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        if (!token.equals(issue.getTrackingToken()))
            throw new RuntimeException("Invalid tracking token");

        if (issue.getStatus() != com.example.ComplainSystem.entity.Status.RESOLVED)
            throw new RuntimeException("Only RESOLVED complaints can be reopened");

        if (issue.getReopenedAt() != null)
            throw new RuntimeException("This complaint has already been reopened once. Please contact support if you need further assistance.");

        // Check 48h window
        if (issue.getResolvedAt() == null ||
                issue.getResolvedAt().plusHours(48).isBefore(java.time.LocalDateTime.now()))
            throw new RuntimeException("The 48-hour reopen window has expired. Please contact support.");

        issue.setStatus(com.example.ComplainSystem.entity.Status.IN_PROGRESS);
        issue.setResolvedAt(null);
        issue.setReopenedAt(java.time.LocalDateTime.now());
        IssuesEntity saved = issueRepository.save(issue);

        // Save reopen comment with the user's reason
        String reason = (body != null && body.get("reason") != null && !body.get("reason").isBlank())
                ? body.get("reason").trim()
                : "User marked this complaint as unsatisfied and requested it be reopened.";
        User commenter = null;
        if (issue.getCreatedBy() != null) {
            commenter = issue.getCreatedBy();
        } else if (issue.getRealCreatorId() != null) {
            commenter = userRepository.findById(issue.getRealCreatorId()).orElse(null);
        }
        if (commenter != null) {
            com.example.ComplainSystem.entity.Comment reopenComment =
                    com.example.ComplainSystem.entity.Comment.builder()
                            .message("[Reopened] " + reason)
                            .issue(saved)
                            .user(commenter)
                            .build();
            commentRepository.save(reopenComment);
        }

        // In-app notification — notify admin directly
        User admin = notificationService.findAdminForIssue(saved);
        if (admin != null) {
            notificationService.notifyAdminOnReopen(saved, admin);
        }

        // Email the admin
        if (admin != null && admin.getEmail() != null && !admin.getEmail().isBlank()) {
            emailService.sendReopenNotification(
                    admin.getEmail(),
                    admin.getName(),
                    saved.getTicketNumber(),
                    saved.getTitle()
            );
        }

        // Email the user confirming the reopen
        if (commenter != null && commenter.getEmail() != null && !commenter.getEmail().isBlank()) {
            emailService.sendStatusUpdate(
                    commenter.getEmail(),
                    commenter.getName(),
                    saved.getTicketNumber(),
                    saved.getTitle(),
                    "RESOLVED",
                    "IN_PROGRESS",
                    saved.getId(),
                    null,
                    saved.getTrackingToken()
            );
        }

        return new ApiResponse<>("success", Map.of(
                "message", "Your complaint has been reopened and is back In Progress.",
                "status",  "IN_PROGRESS"
        ));
    }
}
