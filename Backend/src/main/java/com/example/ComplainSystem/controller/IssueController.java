package com.example.ComplainSystem.controller;

import com.example.ComplainSystem.dto.request.AssignRequest;
import com.example.ComplainSystem.dto.request.IssueRequest;
import com.example.ComplainSystem.dto.request.StatusUpdateRequest;
import com.example.ComplainSystem.dto.response.ApiResponse;
import com.example.ComplainSystem.dto.response.IssueResponse;
import com.example.ComplainSystem.entity.IssuesEntity;
import com.example.ComplainSystem.repository.IssueRepo;
import com.example.ComplainSystem.services.FileUploadService;
import com.example.ComplainSystem.services.IssueService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/issues")
public class IssueController {

    private final IssueService issueService;
    private final IssueRepo issueRepo;
    private final FileUploadService fileUploadService;

    public IssueController(IssueService issueService, IssueRepo issueRepo,
                           FileUploadService fileUploadService) {
        this.issueService = issueService;
        this.issueRepo = issueRepo;
        this.fileUploadService = fileUploadService;
    }

    @PostMapping(consumes = { MediaType.MULTIPART_FORM_DATA_VALUE, MediaType.APPLICATION_JSON_VALUE })
    public ApiResponse<IssueResponse> createIssue(
            @RequestPart("data") @Valid IssueRequest request,
            @RequestPart(value = "files", required = false) List<MultipartFile> files,
            Authentication auth) {
        return new ApiResponse<>("success", issueService.createIssue(request, files, auth.getName()));
    }

    @GetMapping
    public List<IssueResponse> getAllIssues(Authentication auth) {
        String email = auth.getName();
        String role  = auth.getAuthorities().iterator().next().getAuthority().replace("ROLE_", "");
        return issueService.getAllIssues(email, role);
    }

    @PostMapping("/assign")
    public IssueResponse assignIssue(@Valid @RequestBody AssignRequest request, Authentication auth) {
        return issueService.assignIssue(request, auth.getName());
    }

    @PutMapping("/status")
    public IssueResponse updateStatus(@Valid @RequestBody StatusUpdateRequest request) {
        return issueService.updateStatus(request);
    }

    @GetMapping("/assignable")
    public List<IssueResponse> getAssignableIssues(Authentication auth) {
        return issueService.getAssignableIssues(auth.getName());
    }

    @GetMapping("/all")
    public List<IssueResponse> getAllIssuesUnfiltered(Authentication auth) {
        String email = auth.getName();
        String role  = auth.getAuthorities().iterator().next().getAuthority().replace("ROLE_", "");
        return issueService.getAllIssues(email, role);
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
