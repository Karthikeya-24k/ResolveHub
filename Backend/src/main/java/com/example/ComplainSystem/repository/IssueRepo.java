package com.example.ComplainSystem.repository;

import com.example.ComplainSystem.entity.IssuesEntity;
import com.example.ComplainSystem.entity.Status;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface IssueRepo extends JpaRepository<IssuesEntity,Long> {

    List<IssuesEntity> findByStatus(Status status);

    List<IssuesEntity> findByPriority(String priority);

    List<IssuesEntity> findByAssignedTo_Id(Long staffId);

    List<IssuesEntity> findByCreatedBy_Email(String email);

    List<IssuesEntity> findByAssignedTo_Email(String email);

    java.util.Optional<IssuesEntity> findByTicketNumber(String ticketNumber);

    List<IssuesEntity> findByOrganizationId(Long organizationId);

    @Query("SELECT i FROM IssuesEntity i LEFT JOIN FETCH i.createdBy WHERE i.organizationId = :orgId OR (i.createdBy IS NOT NULL AND i.createdBy.organizationId = :orgId)")
    List<IssuesEntity> findAllByOrgIdOrCreatorOrgId(@org.springframework.data.repository.query.Param("orgId") Long orgId);

    // OPEN or UNDER_REVIEW issues with no staff assigned yet
    @Query("SELECT i FROM IssuesEntity i WHERE i.status IN ('OPEN', 'UNDER_REVIEW') AND i.assignedTo IS NULL")
    List<IssuesEntity> findAssignableIssues();

    @Query("SELECT i FROM IssuesEntity i WHERE i.status IN ('OPEN', 'UNDER_REVIEW') AND i.assignedTo IS NULL AND i.organizationId = :orgId")
    List<IssuesEntity> findAssignableIssuesByOrg(@org.springframework.data.repository.query.Param("orgId") Long orgId);
}
