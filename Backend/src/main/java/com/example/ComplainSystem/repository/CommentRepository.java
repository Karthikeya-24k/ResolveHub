package com.example.ComplainSystem.repository;

import com.example.ComplainSystem.entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {

    @Query("SELECT c FROM Comment c JOIN FETCH c.user WHERE c.issue.id = :issueId")
    List<Comment> findByIssue_Id(@Param("issueId") Long issueId);
}
    