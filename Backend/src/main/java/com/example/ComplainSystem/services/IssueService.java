package com.example.ComplainSystem.services;

import com.example.ComplainSystem.dto.request.AssignRequest;
import com.example.ComplainSystem.dto.request.StatusUpdateRequest;
import com.example.ComplainSystem.dto.response.CommentResponse;
import com.example.ComplainSystem.entity.Status;
import com.example.ComplainSystem.entity.User;
import com.example.ComplainSystem.repository.CommentRepository;
import com.example.ComplainSystem.repository.UserRepo;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Locale;

import com.example.ComplainSystem.dto.request.IssueRequest;
import com.example.ComplainSystem.dto.response.IssueResponse;
import com.example.ComplainSystem.entity.IssuesEntity;
import com.example.ComplainSystem.repository.IssueRepo;

@Service
public class IssueService {

    private final IssueRepo issueRepository;
    private final UserRepo userRepository;
    private final CommentRepository commentRepository;

    public IssueService(UserRepo userRepository, IssueRepo issueRepository, CommentRepository commentRepository) {
        this.userRepository = userRepository;
        this.issueRepository = issueRepository;
        this.commentRepository = commentRepository;
    }

    // Used for list endpoints — no comments loaded
    private IssueResponse mapToResponse(IssuesEntity issue) {
        return new IssueResponse(
                issue.getId(),
                issue.getTitle(),
                issue.getDescription(),
                issue.getStatus().name(),
                issue.getPriority(),
                null
        );
    }

    // Used for detail endpoint — loads comments
    private IssueResponse mapToDetailResponse(IssuesEntity issue) {
        List<CommentResponse> comments = commentRepository.findByIssue_Id(issue.getId())
                .stream()
                .map(c -> new CommentResponse(c.getId(), c.getMessage(), c.getUser().getName()))
                .toList();
        return new IssueResponse(
                issue.getId(),
                issue.getTitle(),
                issue.getDescription(),
                issue.getStatus().name(),
                issue.getPriority(),
                comments
        );
    }

    public IssueResponse createIssue(IssueRequest request, String email) {
        User creator = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Authenticated user not found"));

        IssuesEntity issue = IssuesEntity.builder()
                .title(request.getTitle().trim())
                .description(request.getDescription().trim())
                .priority("LOW")
                .status(Status.OPEN)
                .createdBy(creator)
                .build();

        return mapToResponse(issueRepository.save(issue));
    }

    public List<IssueResponse> getAllIssues(String email, String role) {
        return switch (role) {
            case "USER"  -> issueRepository.findByCreatedBy_Email(email)
                                .stream().map(this::mapToResponse).toList();
            case "STAFF" -> issueRepository.findByAssignedTo_Email(email)
                                .stream().map(this::mapToResponse).toList();
            default      -> issueRepository.findAll()
                                .stream().map(this::mapToResponse).toList();
        };
    }

    public List<IssueResponse> getAllIssuesUnfiltered() {
        return issueRepository.findAll().stream().map(this::mapToResponse).toList();
    }

    public IssueResponse assignIssue(AssignRequest request, String adminEmail) {
        IssuesEntity issue = issueRepository.findById(request.getIssueId())
                .orElseThrow(() -> new RuntimeException("Issue not found with id: " + request.getIssueId()));

        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new RuntimeException("Admin user not found"));

        if (!"ADMIN".equals(admin.getRole()))
            throw new RuntimeException("Only ADMIN users can assign issues");

        User staff = userRepository.findById(request.getStaffId())
                .orElseThrow(() -> new RuntimeException("Staff user not found with id: " + request.getStaffId()));

        if (!"STAFF".equals(staff.getRole()))
            throw new RuntimeException("Target user is not a STAFF member");

        issue.setAssignedBy(admin);
        issue.setAssignedTo(staff);
        issue.setPriority(request.getPriority().toUpperCase(Locale.ROOT));
        issue.setStatus(Status.ASSIGNED);

        return mapToResponse(issueRepository.save(issue));
    }

    public IssueResponse updateStatus(StatusUpdateRequest request) {
        Status newStatus;
        try {
            newStatus = Status.valueOf(request.getStatus().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid status '" + request.getStatus() + "'. Allowed: OPEN, UNDER_REVIEW, ASSIGNED, IN_PROGRESS, RESOLVED, CLOSED");
        }

        IssuesEntity issue = issueRepository.findById(request.getIssueId())
                .orElseThrow(() -> new RuntimeException("Issue not found with id: " + request.getIssueId()));

        if (!isValidTransition(issue.getStatus(), newStatus))
            throw new RuntimeException("Invalid status transition from " + issue.getStatus() + " to " + newStatus);

        issue.setStatus(newStatus);
        return mapToResponse(issueRepository.save(issue));
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

    public IssueResponse getIssueById(Long id) {
        IssuesEntity issue = issueRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Issue not found with id: " + id));
        return mapToDetailResponse(issue);
    }

    public List<IssueResponse> filterIssues(String status, String priority, Long staffId, String email, String role) {
        if (status != null) {
            Status s;
            try {
                s = Status.valueOf(status.toUpperCase(Locale.ROOT));
            } catch (IllegalArgumentException e) {
                throw new RuntimeException("Invalid status filter: " + status);
            }
            return issueRepository.findByStatus(s).stream().map(this::mapToResponse).toList();
        }
        if (priority != null)
            return issueRepository.findByPriority(priority.toUpperCase(Locale.ROOT)).stream().map(this::mapToResponse).toList();
        if (staffId != null)
            return issueRepository.findByAssignedTo_Id(staffId).stream().map(this::mapToResponse).toList();

        return getAllIssues(email, role);
    }
}
