package com.example.ComplainSystem.repository;

import com.example.ComplainSystem.entity.Attachment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AttachmentRepository extends JpaRepository<Attachment, Long> {
    List<Attachment> findByIssueIdAndCommentIdIsNull(Long issueId);
    List<Attachment> findByCommentId(Long commentId);
    List<Attachment> findByIssueId(Long issueId);
}
