package com.example.ComplainSystem.repository;

import com.example.ComplainSystem.entity.Organization;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface OrganizationRepository extends JpaRepository<Organization, Long> {

    Optional<Organization> findBySlug(String slug);

    Optional<Organization> findByApiKey(String apiKey);

    boolean existsBySlug(String slug);
}
