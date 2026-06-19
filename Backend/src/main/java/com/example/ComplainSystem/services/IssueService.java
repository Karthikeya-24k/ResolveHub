package com.example.ComplainSystem.services;

import com.example.ComplainSystem.dto.request.AssignRequest;
import com.example.ComplainSystem.dto.request.IssueRequest;
import com.example.ComplainSystem.dto.request.StatusUpdateRequest;
import com.example.ComplainSystem.dto.response.CommentResponse;
import com.example.ComplainSystem.dto.response.IssueResponse;
import com.example.ComplainSystem.entity.IssuesEntity;
import com.example.ComplainSystem.entity.Status;
import com.example.ComplainSystem.entity.User;
import com.example.ComplainSystem.repository.CommentRepository;
import com.example.ComplainSystem.repository.IssueRepo;
import com.example.ComplainSystem.repository.UserRepo;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;

@Service
public class IssueService {

    private final IssueRepo issueRepository;
    private final UserRepo userRepository;
    private final CommentRepository commentRepository;
    private final NotificationService notificationService;
    private final EmailService emailService;

    public IssueService(UserRepo userRepository, IssueRepo issueRepository,
                        CommentRepository commentRepository,
                        NotificationService notificationService,
                        EmailService emailService) {
        this.userRepository      = userRepository;
        this.issueRepository     = issueRepository;
        this.commentRepository   = commentRepository;
        this.notificationService = notificationService;
        this.emailService        = emailService;
    }

    // ── Mapping ────────────────────────────────────────────────────────────────

    private IssueResponse mapToResponse(IssuesEntity issue) {
        String displayCreator = resolveCreatorName(issue);
        return new IssueResponse(
                issue.getId(),
                issue.getTicketNumber(),
                issue.getTitle(),
                issue.getDescription(),
                issue.getStatus().name(),
                issue.getPriority(),
                null,
                issue.getAssignedTo() != null ? issue.getAssignedTo().getName() : null,
                displayCreator,
                issue.getOrganizationId(),
                issue.isAnonymous(),
                issue.getResolvedAt()
        );
    }

    private IssueResponse mapToDetailResponse(IssuesEntity issue) {
        List<CommentResponse> comments = commentRepository.findByIssue_Id(issue.getId())
                .stream()
                .map(c -> new CommentResponse(c.getId(), c.getMessage(), c.getUser().getName()))
                .toList();
        String displayCreator = resolveCreatorName(issue);
        return new IssueResponse(
                issue.getId(),
                issue.getTicketNumber(),
                issue.getTitle(),
                issue.getDescription(),
                issue.getStatus().name(),
                issue.getPriority(),
                comments,
                issue.getAssignedTo() != null ? issue.getAssignedTo().getName() : null,
                displayCreator,
                issue.getOrganizationId(),
                issue.isAnonymous(),
                issue.getResolvedAt()
        );
    }

    /** Returns "Anonymous User" if anonymous, otherwise real name */
    private String resolveCreatorName(IssuesEntity issue) {
        if (issue.isAnonymous()) return "Anonymous User";
        return issue.getCreatedBy() != null ? issue.getCreatedBy().getName() : null;
    }

    /** Generates next ticket number: RH-1001, RH-1002, ... */
    private String generateTicketNumber() {
        long count = issueRepository.count();
        return "RH-" + (1000 + count + 1);
    }

    // ── Create ─────────────────────────────────────────────────────────────────

    public IssueResponse createIssue(IssueRequest request, String email) {
        User creator = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Authenticated user not found"));

        IssuesEntity issue = IssuesEntity.builder()
                .ticketNumber(generateTicketNumber())
                .title(request.getTitle().trim())
                .description(request.getDescription().trim())
                .priority("LOW")
                .status(Status.OPEN)
                .createdBy(creator)
                .organizationId(creator.getOrganizationId())
                .anonymous(request.isAnonymous())
                .realCreatorId(request.isAnonymous() ? creator.getId() : null)
                .build();

        IssuesEntity saved = issueRepository.save(issue);

        // Notify the admin about the new complaint
        notificationService.notifyAdminOnNewIssue(saved);

        // Send confirmation email — skip for anonymous submissions
        if (!saved.isAnonymous() && creator.getEmail() != null) {
            emailService.sendComplaintCreated(
                    creator.getEmail(),
                    creator.getName(),
                    saved.getTicketNumber(),
                    saved.getTitle(),
                    "ResolveHub"
            );
        }

        return mapToResponse(saved);
    }

    public List<IssueResponse> getAllIssues(String email, String role) {
        return switch (role) {
            case "USER" -> issueRepository.findByCreatedBy_Email(email)
                    .stream().map(this::mapToResponse).toList();
            case "STAFF" -> issueRepository.findByAssignedTo_Email(email)
                    .stream().map(this::mapToResponse).toList();
            case "ADMIN" -> {
                User admin = userRepository.findByEmail(email)
                        .orElseThrow(() -> new RuntimeException("Admin not found"));

                // Collect all issue IDs visible to this admin to avoid duplicates
                java.util.Set<Long> seen = new java.util.HashSet<>();
                java.util.List<IssueResponse> result = new java.util.ArrayList<>();

                // 1. Issues in the same organization
                if (admin.getOrganizationId() != null) {
                    issueRepository.findByOrganizationId(admin.getOrganizationId())
                            .forEach(i -> { if (seen.add(i.getId())) result.add(mapToResponse(i)); });
                }

                // 2. Issues created by users directly managed by this admin
                //    (covers self-registered users with null organizationId)
                issueRepository.findAll().stream()
                        .filter(i -> i.getCreatedBy() != null &&
                                admin.getId().equals(i.getCreatedBy().getManagedByAdminId()))
                        .forEach(i -> { if (seen.add(i.getId())) result.add(mapToResponse(i)); });

                yield result;
            }
            default -> issueRepository.findAll()
                    .stream().map(this::mapToResponse).toList();
        };
    }

    public List<IssueResponse> getAllIssuesUnfiltered() {
        return issueRepository.findAll().stream().map(this::mapToResponse).toList();
    }

    public IssueResponse getIssueById(Long id) {
        IssuesEntity issue = issueRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Issue not found with id: " + id));
        return mapToDetailResponse(issue);
    }

    public List<IssueResponse> getAssignableIssues(String adminEmail) {
        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new RuntimeException("Admin not found"));

        java.util.Set<Long> seen = new java.util.HashSet<>();
        java.util.List<IssueResponse> result = new java.util.ArrayList<>();

        // 1. OPEN unassigned issues in the admin's org
        if (admin.getOrganizationId() != null) {
            issueRepository.findAssignableIssuesByOrg(admin.getOrganizationId())
                    .forEach(i -> { if (seen.add(i.getId())) result.add(mapToResponse(i)); });
        }

        // 2. OPEN unassigned issues created by users managed by this admin
        issueRepository.findAssignableIssues().stream()
                .filter(i -> i.getCreatedBy() != null &&
                        admin.getId().equals(i.getCreatedBy().getManagedByAdminId()))
                .forEach(i -> { if (seen.add(i.getId())) result.add(mapToResponse(i)); });

        return result;
    }

    // ── Assign ─────────────────────────────────────────────────────────────────

    public IssueResponse assignIssue(AssignRequest request, String adminEmail) {
        IssuesEntity issue = issueRepository.findById(request.getIssueId())
                .orElseThrow(() -> new RuntimeException("Issue not found with id: " + request.getIssueId()));

        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new RuntimeException("Admin user not found"));

        if (!"ADMIN".equals(admin.getRole()))
            throw new RuntimeException("Only ADMIN users can assign issues");

        if (issue.getStatus() == Status.CLOSED)
            throw new RuntimeException("Cannot assign a CLOSED issue");

        if (issue.getAssignedTo() != null)
            throw new RuntimeException("Issue is already assigned to " + issue.getAssignedTo().getName());

        if (issue.getStatus() != Status.OPEN && issue.getStatus() != Status.UNDER_REVIEW)
            throw new RuntimeException("Only OPEN or UNDER_REVIEW issues can be assigned");

        User staff = userRepository.findById(request.getStaffId())
                .orElseThrow(() -> new RuntimeException("Staff user not found with id: " + request.getStaffId()));

        if (!"STAFF".equals(staff.getRole()))
            throw new RuntimeException("Target user is not a STAFF member");

        // Org isolation check
        if (admin.getOrganizationId() != null && !admin.getOrganizationId().equals(staff.getOrganizationId()))
            throw new RuntimeException("Staff member does not belong to your organization");

        issue.setAssignedBy(admin);
        issue.setAssignedTo(staff);
        issue.setPriority(request.getPriority().toUpperCase(Locale.ROOT));
        issue.setStatus(Status.ASSIGNED);

        return mapToResponse(issueRepository.save(issue));
    }

    // ── Status ─────────────────────────────────────────────────────────────────

    public IssueResponse updateStatus(StatusUpdateRequest request) {
        Status newStatus;
        try {
            newStatus = Status.valueOf(request.getStatus().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid status '" + request.getStatus() +
                    "'. Allowed: OPEN, UNDER_REVIEW, ASSIGNED, IN_PROGRESS, RESOLVED, CLOSED", e);
        }

        IssuesEntity issue = issueRepository.findById(request.getIssueId())
                .orElseThrow(() -> new RuntimeException("Issue not found with id: " + request.getIssueId()));

        if (!isValidTransition(issue.getStatus(), newStatus))
            throw new RuntimeException("Invalid status transition from " + issue.getStatus() + " to " + newStatus);

        // Capture old status BEFORE mutating the entity
        String oldStatusName = issue.getStatus().name();

        issue.setStatus(newStatus);

        // Set or clear resolvedAt
        if (newStatus == Status.RESOLVED) {
            issue.setResolvedAt(java.time.LocalDateTime.now());
        } else {
            issue.setResolvedAt(null);
        }

        IssuesEntity saved = issueRepository.save(issue);

        // Save resolution note as a comment if provided
        String resolutionNote = request.getResolutionNote();
        if (newStatus == Status.RESOLVED
                && resolutionNote != null
                && !resolutionNote.isBlank()) {
            // Find the staff/admin who updated the status — use assignedTo as proxy
            User noter = saved.getAssignedTo();
            if (noter != null) {
                com.example.ComplainSystem.entity.Comment noteComment =
                        com.example.ComplainSystem.entity.Comment.builder()
                                .message("[Resolution Note] " + resolutionNote.trim())
                                .issue(saved)
                                .user(noter)
                                .build();
                commentRepository.save(noteComment);
            }
        }

        notificationService.notifyOnStatusChange(saved, newStatus);

        // Send status update email to the real creator (handles anonymous too)
        User recipient = null;
        if (saved.isAnonymous() && saved.getRealCreatorId() != null) {
            recipient = userRepository.findById(saved.getRealCreatorId()).orElse(null);
        } else if (saved.getCreatedBy() != null) {
            recipient = saved.getCreatedBy();
        }
        if (recipient != null && recipient.getEmail() != null && !recipient.getEmail().isBlank()) {
            // Suppress the reopen button if the issue has already been reopened once
            String tokenForEmail = (newStatus == Status.RESOLVED && saved.getReopenedAt() != null)
                    ? null
                    : saved.getTrackingToken();
            emailService.sendStatusUpdate(
                    recipient.getEmail(),
                    recipient.getName(),
                    saved.getTicketNumber() != null ? saved.getTicketNumber() : "#" + saved.getId(),
                    saved.getTitle(),
                    oldStatusName,
                    newStatus.name(),
                    saved.getId(),
                    resolutionNote,
                    tokenForEmail
            );
        }

        return mapToResponse(saved);
    }

    private boolean isValidTransition(Status current, Status next) {
        return switch (current) {
            case OPEN         -> next == Status.UNDER_REVIEW;
            case UNDER_REVIEW -> next == Status.ASSIGNED;
            case ASSIGNED     -> next == Status.IN_PROGRESS;
            case IN_PROGRESS  -> next == Status.RESOLVED;
            case RESOLVED     -> next == Status.CLOSED;
            default           -> false;
        };
    }

    // ── Super Admin Audit ──────────────────────────────────────────────────────

    /** Level 2: all issues for a specific org — by organizationId OR by creator's org */
    @Transactional(readOnly = true)
    public List<IssueResponse> getIssuesByOrg(Long orgId) {
        // Use findAll() inside @Transactional so lazy relations load safely
        return issueRepository.findAll().stream()
                .filter(i -> {
                    // Match if issue has org set directly
                    if (orgId.equals(i.getOrganizationId())) return true;
                    // Match if creator belongs to this org
                    if (i.getCreatedBy() != null &&
                            orgId.equals(i.getCreatedBy().getOrganizationId())) return true;
                    return false;
                })
                .map(this::mapToResponse)
                .toList();
    }

    /** Level 3: escalated only — HIGH priority OR status is OPEN/ASSIGNED/IN_PROGRESS */
    @Transactional(readOnly = true)
    public List<IssueResponse> getEscalatedIssuesByOrg(Long orgId) {
        return issueRepository.findAll().stream()
                .filter(i -> {
                    if (!orgId.equals(i.getOrganizationId())) {
                        if (i.getCreatedBy() == null ||
                                !orgId.equals(i.getCreatedBy().getOrganizationId())) return false;
                    }
                    return "HIGH".equals(i.getPriority()) ||
                            i.getStatus() == Status.OPEN ||
                            i.getStatus() == Status.ASSIGNED ||
                            i.getStatus() == Status.IN_PROGRESS;
                })
                .map(this::mapToResponse)
                .toList();
    }

    // ── Filter ─────────────────────────────────────────────────────────────────

    public List<IssueResponse> filterIssues(String status, String priority, Long staffId, String email, String role) {
        if (status != null) {
            Status s;
            try { s = Status.valueOf(status.toUpperCase(Locale.ROOT)); }
            catch (IllegalArgumentException e) { throw new RuntimeException("Invalid status filter: " + status, e); }
            return issueRepository.findByStatus(s).stream().map(this::mapToResponse).toList();
        }
        if (priority != null)
            return issueRepository.findByPriority(priority.toUpperCase(Locale.ROOT))
                    .stream().map(this::mapToResponse).toList();
        if (staffId != null)
            return issueRepository.findByAssignedTo_Id(staffId).stream().map(this::mapToResponse).toList();

        return getAllIssues(email, role);
    }
}
