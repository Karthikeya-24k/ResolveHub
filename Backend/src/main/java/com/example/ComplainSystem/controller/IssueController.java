package com.example.ComplainSystem.controller;

import java.util.List;

import com.example.ComplainSystem.dto.request.AssignRequest;
import com.example.ComplainSystem.dto.request.StatusUpdateRequest;
import com.example.ComplainSystem.dto.response.ApiResponse;
import com.example.ComplainSystem.entity.IssuesEntity;
import com.example.ComplainSystem.repository.IssueRepo;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.example.ComplainSystem.dto.request.IssueRequest;
import com.example.ComplainSystem.dto.response.IssueResponse;
import com.example.ComplainSystem.services.IssueService;

@RestController
@RequestMapping("/issues")
public class IssueController {

    private final IssueService issueService;
    private final IssueRepo issueRepo;

    public IssueController(IssueService issueService, IssueRepo issueRepo) {
        this.issueService = issueService;
        this.issueRepo = issueRepo;
    }

    @PostMapping
    public ApiResponse<IssueResponse> createIssue(@RequestBody IssueRequest request,
                                                   Authentication auth) {
        return new ApiResponse<>("success", issueService.createIssue(request, auth.getName()));
    }

    @GetMapping
    public List<IssueResponse> getAllIssues(Authentication auth) {
        String email = auth.getName();
        String role  = auth.getAuthorities().iterator().next().getAuthority().replace("ROLE_", "");
        return issueService.getAllIssues(email, role);
    }

    @PostMapping("/assign")
    public IssueResponse assignIssue(@RequestBody AssignRequest request, Authentication auth) {
        return issueService.assignIssue(request, auth.getName());
    }

    @PutMapping("/status")
    public IssueResponse updateStatus(@RequestBody StatusUpdateRequest request) {
        return issueService.updateStatus(request);
    }

    @GetMapping("/all")
    public List<IssueResponse> getAllIssuesUnfiltered() {
        return issueService.getAllIssuesUnfiltered();
    }

    @GetMapping("/page")
    public Page<IssuesEntity> getIssues(@RequestParam int page, @RequestParam int size) {
        return issueRepo.findAll(PageRequest.of(page, size));
    }

    @GetMapping("/filter")
    public List<IssueResponse> filterIssues(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String priority,
            @RequestParam(required = false) Long staffId,
            Authentication auth) {
        String email = auth.getName();
        String role  = auth.getAuthorities().iterator().next().getAuthority().replace("ROLE_", "");
        return issueService.filterIssues(status, priority, staffId, email, role);
    }

    @GetMapping("/{id}")
    public ApiResponse<IssueResponse> getIssueById(@PathVariable Long id) {
        return new ApiResponse<>("success", issueService.getIssueById(id));
    }
}
