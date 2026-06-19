package com.example.ComplainSystem.controller;

import com.example.ComplainSystem.dto.request.ExternalLoginRequest;
import com.example.ComplainSystem.dto.request.OrganizationRequest;
import com.example.ComplainSystem.dto.response.ApiResponse;
import com.example.ComplainSystem.dto.response.IssueResponse;
import com.example.ComplainSystem.dto.response.OrganizationResponse;
import com.example.ComplainSystem.services.IssueService;
import com.example.ComplainSystem.services.OrganizationService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/organizations")
public class OrganizationController {

    private final OrganizationService orgService;
    private final IssueService issueService;

    public OrganizationController(OrganizationService orgService, IssueService issueService) {
        this.orgService   = orgService;
        this.issueService = issueService;
    }

    @GetMapping
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ApiResponse<List<OrganizationResponse>> getAll() {
        return new ApiResponse<>("success", orgService.getAllOrganizations());
    }

    /** ADMIN fetches their own org details including API key */
    @GetMapping("/my")
    @PreAuthorize("hasAnyRole('ADMIN')")
    public ApiResponse<OrganizationResponse> getMyOrg(Authentication auth) {
        return new ApiResponse<>("success", orgService.getMyOrganization(auth.getName()));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ApiResponse<OrganizationResponse> getById(@PathVariable Long id) {
        return new ApiResponse<>("success", orgService.getById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ApiResponse<OrganizationResponse> create(@Valid @RequestBody OrganizationRequest request) {
        return new ApiResponse<>("success", orgService.create(request));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ApiResponse<OrganizationResponse> updateStatus(@PathVariable Long id,
                                                           @RequestParam String status) {
        return new ApiResponse<>("success", orgService.updateStatus(id, status));
    }

    @PutMapping("/{id}/regenerate-key")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ApiResponse<OrganizationResponse> regenerateKey(@PathVariable Long id) {
        return new ApiResponse<>("success", orgService.regenerateApiKey(id));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ApiResponse<String> delete(@PathVariable Long id) {
        orgService.delete(id);
        return new ApiResponse<>("success", "Organization deleted");
    }

    /**
     * SUPER_ADMIN drill-down: all issues for a specific organization.
     * Level 2 audit view.
     */
    @GetMapping("/{id}/issues")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ApiResponse<List<IssueResponse>> getOrgIssues(@PathVariable Long id) {
        return new ApiResponse<>("success", issueService.getIssuesByOrg(id));
    }

    /**
     * SUPER_ADMIN drill-down: escalated/sensitive issues only for a specific org.
     * Level 3 audit view — HIGH priority OR unresolved (OPEN / ASSIGNED / IN_PROGRESS).
     */
    @GetMapping("/{id}/issues/escalated")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ApiResponse<List<IssueResponse>> getEscalatedOrgIssues(@PathVariable Long id) {
        return new ApiResponse<>("success", issueService.getEscalatedIssuesByOrg(id));
    }

    /**
     * External portal login — called by org portals with their API key.
     * Header: X-Org-Api-Key: <apiKey>
     */
    @PostMapping("/auth/external")
    public ApiResponse<String> externalLogin(
            @RequestHeader("X-Org-Api-Key") String apiKey,
            @Valid @RequestBody ExternalLoginRequest request) {
        return new ApiResponse<>("success", orgService.externalLogin(apiKey, request));
    }
}
