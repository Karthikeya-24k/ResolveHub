package com.example.ComplainSystem.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "attachments")
public class Attachment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Issue this attachment belongs to */
    private Long issueId;

    /** Null if attached to the issue itself; set if attached to a comment */
    private Long commentId;

    /** Cloudinary secure URL */
    @Column(nullable = false)
    private String url;

    /** Cloudinary public_id — needed for deletion */
    @Column(nullable = false)
    private String publicId;

    /** Original filename from the client */
    private String originalName;

    /** MIME type e.g. image/jpeg, application/pdf */
    private String fileType;

    /** File size in bytes */
    private Long fileSize;

    @Column(nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime uploadedAt = LocalDateTime.now();
}
