package com.example.ComplainSystem.services;

import com.example.ComplainSystem.dto.response.NotificationResponse;
import com.example.ComplainSystem.entity.IssuesEntity;
import com.example.ComplainSystem.entity.Notification;
import com.example.ComplainSystem.entity.Status;
import com.example.ComplainSystem.entity.User;
import com.example.ComplainSystem.repository.NotificationRepository;
import com.example.ComplainSystem.repository.UserRepo;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepo userRepository;

    public NotificationService(NotificationRepository notificationRepository, UserRepo userRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    /** Finds the admin responsible for an issue — checks managedByAdminId first, then org-level admin */
    public User findAdminForIssue(IssuesEntity issue) {
        // 1. Direct ownership via managedByAdminId on the creator
        if (issue.getCreatedBy() != null && issue.getCreatedBy().getManagedByAdminId() != null) {
            return userRepository.findById(issue.getCreatedBy().getManagedByAdminId()).orElse(null);
        }
        // 2. Org-level: find any ADMIN in the same organization
        if (issue.getOrganizationId() != null) {
            return userRepository.findByOrganizationId(issue.getOrganizationId())
                    .stream()
                    .filter(u -> "ADMIN".equals(u.getRole()))
                    .findFirst()
                    .orElse(null);
        }
        return null;
    }

    /** Notifies admin when a user reopens a resolved complaint */
    public void notifyAdminOnReopen(IssuesEntity issue, User admin) {
        String message = "Complaint \"" + issue.getTitle() + "\" was reopened by the user (marked unsatisfied)";
        saveNotification(admin, message, issue.getId(), issue.getTitle());
    }

    private void saveNotification(User recipient, String message, Long issueId, String issueTitle) {
        notificationRepository.save(
            Notification.builder()
                .recipient(recipient)
                .message(message)
                .issueId(issueId)
                .issueTitle(issueTitle)
                .build()
        );
    }

    /**
     * Called after a new issue is created.
     * Notifies the admin responsible for this issue.
     */
    public void notifyAdminOnNewIssue(IssuesEntity issue) {
        User admin = findAdminForIssue(issue);
        if (admin == null) return;

        String message = "New complaint raised: \"" + issue.getTitle() + "\"";
        saveNotification(admin, message, issue.getId(), issue.getTitle());
    }

    /**
     * Called after every comment is saved.
     * Notifies the issue creator, assigned staff, and the managing admin —
     * excluding whoever posted the comment.
     */
    public void notifyOnComment(IssuesEntity issue, User commenter) {
        String issueTitle = issue.getTitle();
        Long issueId      = issue.getId();
        String text       = commenter.getName() + " commented on \"" + issueTitle + "\"";

        List<User> recipients = new ArrayList<>();

        // 1. Issue creator — handle anonymous (createdBy is null, use realCreatorId)
        User creator = null;
        if (issue.getCreatedBy() != null) {
            creator = issue.getCreatedBy();
        } else if (issue.getRealCreatorId() != null) {
            creator = userRepository.findById(issue.getRealCreatorId()).orElse(null);
        }
        if (creator != null && !creator.getId().equals(commenter.getId())) {
            recipients.add(creator);
        }

        // 2. Assigned staff
        if (issue.getAssignedTo() != null && !issue.getAssignedTo().getId().equals(commenter.getId())) {
            recipients.add(issue.getAssignedTo());
        }

        // 3. Admin (via managedByAdminId or org-level)
        User admin = findAdminForIssue(issue);
        if (admin != null) {
            boolean alreadyAdded = recipients.stream().anyMatch(r -> r.getId().equals(admin.getId()));
            if (!alreadyAdded && !admin.getId().equals(commenter.getId())) {
                recipients.add(admin);
            }
        }

        for (User recipient : recipients) {
            saveNotification(recipient, text, issueId, issueTitle);
        }
    }

    /**
     * Called after a status change.
     * Notifies the issue creator AND the admin when status is RESOLVED.
     */
    public void notifyOnStatusChange(IssuesEntity issue, Status newStatus) {
        String statusLabel = newStatus.name().replace("_", " ");
        String message     = "Complaint \"" + issue.getTitle() + "\" status changed to " + statusLabel;

        // 1. Notify the creator (or real creator for anonymous)
        User creator = null;
        if (issue.isAnonymous() && issue.getRealCreatorId() != null) {
            creator = userRepository.findById(issue.getRealCreatorId()).orElse(null);
        } else if (issue.getCreatedBy() != null) {
            creator = issue.getCreatedBy();
        }
        if (creator != null) {
            String creatorMessage = "Your complaint \"" + issue.getTitle() + "\" status changed to " + statusLabel;
            saveNotification(creator, creatorMessage, issue.getId(), issue.getTitle());
        }

        // 2. Notify admin when RESOLVED
        if (newStatus == Status.RESOLVED) {
            User admin = findAdminForIssue(issue);
            if (admin != null && (creator == null || !admin.getId().equals(creator.getId()))) {
                String adminMessage = "Complaint \"" + issue.getTitle() + "\" has been resolved";
                saveNotification(admin, adminMessage, issue.getId(), issue.getTitle());
            }
        }
    }

    @Transactional(readOnly = true)
    public List<NotificationResponse> getNotificationsForUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return notificationRepository
                .findByRecipient_IdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(n -> new NotificationResponse(
                        n.getId(),
                        n.getMessage(),
                        n.getIssueId(),
                        n.getIssueTitle(),
                        n.isRead(),
                        n.getCreatedAt()
                ))
                .toList();
    }

    @Transactional
    public void markAllRead(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        notificationRepository.markAllReadForRecipient(user.getId());
    }
}
