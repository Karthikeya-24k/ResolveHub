package com.example.ComplainSystem.repository;

import com.example.ComplainSystem.entity.IssuesEntity;
import com.example.ComplainSystem.entity.Status;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface IssueRepo extends JpaRepository<IssuesEntity,Long> {

    List<IssuesEntity> findByStatus(Status status);

    List<IssuesEntity> findByPriority(String priority);

    List<IssuesEntity> findByAssignedTo_Id(Long staffId);

    List<IssuesEntity> findByCreatedBy_Email(String email);

    List<IssuesEntity> findByAssignedTo_Email(String email);
}
