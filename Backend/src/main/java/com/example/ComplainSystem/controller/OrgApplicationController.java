package com.example.ComplainSystem.controller;

import com.example.ComplainSystem.dto.request.OrgApplicationRequest;
import com.example.ComplainSystem.dto.response.ApiResponse;
import com.example.ComplainSystem.dto.response.ApprovalResult;
import com.example.ComplainSystem.dto.response.OrgApplicationResponse;
import com.example.ComplainSystem.services.OrgApplicationService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/applications")
public class OrgApplicationController {

    private final OrgApplicationService appService;

    public OrgApplicationController(OrgApplicationService appService) {
        this.appService = appService;
    }

    @PostMapping("/submit")
    public ApiResponse<OrgApplicationResponse> submit(@Valid @RequestBody OrgApplicationRequest request) {
        return new ApiResponse<>("success", appService.submit(request));
    }

    @GetMapping
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ApiResponse<List<OrgApplicationResponse>> getAll() {
        return new ApiResponse<>("success", appService.getAll());
    }

    @GetMapping("/pending")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ApiResponse<List<OrgApplicationResponse>> getPending() {
        return new ApiResponse<>("success", appService.getPending());
    }

    @GetMapping("/stats")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ApiResponse<OrgApplicationService.OrgApplicationStats> getStats() {
        return new ApiResponse<>("success", appService.getStats());
    }

    @PostMapping("/{id}/approve")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ApiResponse<ApprovalResult> approve(@PathVariable Long id) {
        return new ApiResponse<>("success", appService.approve(id));
    }

    /** Body: { "reason": "optional reason text" } */
    @PostMapping("/{id}/reject")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ApiResponse<OrgApplicationResponse> reject(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body) {
        String reason = body != null ? body.get("reason") : null;
        return new ApiResponse<>("success", appService.reject(id, reason));
    }
}
