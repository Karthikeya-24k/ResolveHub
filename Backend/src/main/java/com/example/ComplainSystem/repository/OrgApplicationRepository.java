package com.example.ComplainSystem.repository;

import com.example.ComplainSystem.entity.OrgApplication;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface OrgApplicationRepository extends JpaRepository<OrgApplication, Long> {

    List<OrgApplication> findByStatusOrderByCreatedAtDesc(String status);

    List<OrgApplication> findAllByOrderByCreatedAtDesc();

    boolean existsByAdminEmail(String adminEmail);

    boolean existsByAdminEmailAndStatusIn(String adminEmail, java.util.List<String> statuses);

    long countByStatus(String status);

    long countByStatusAndCreatedAtAfter(String status, LocalDateTime after);
}
