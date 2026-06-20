package com.example.ComplainSystem.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "issues")
public class IssuesEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    private Status status;

    private String priority;

    @ManyToOne
    @JoinColumn(name = "created_by")
    @JsonIgnoreProperties({"password", "role"})
    private User createdBy;

    @ManyToOne
    @JoinColumn(name = "assigned_to")
    @JsonIgnoreProperties({"password", "role"})
    private User assignedTo;

    @ManyToOne
    @JoinColumn(name = "assigned_by")
    @JsonIgnoreProperties({"password", "role"})
    private User assignedBy;

    /** Organization this issue belongs to */
    private Long organizationId;

    /** Human-readable ticket number e.g. RH-1001 */
    private String ticketNumber;

    /** If true, createdBy name is shown as Anonymous User in responses */
    @Column(nullable = false)
    @Builder.Default
    private boolean anonymous = false;

    /** Stores real creator id when anonymous = true, for audit purposes */
    private Long realCreatorId;

    /** Secure token for magic tracking link — set on public portal submissions */
    private String trackingToken;

    /** Set when status becomes RESOLVED. Used for 48h reopen window. */
    private java.time.LocalDateTime resolvedAt;

    /** Set when user reopens once. Prevents reopening a second time. */
    private java.time.LocalDateTime reopenedAt;

    /** Timestamp when this complaint was first created */
    @Column(nullable = false, updatable = false)
    @Builder.Default
    private java.time.LocalDateTime createdAt = java.time.LocalDateTime.now();

}