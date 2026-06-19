package com.example.ComplainSystem.services;

import com.example.ComplainSystem.dto.request.OrgApplicationRequest;
import com.example.ComplainSystem.dto.response.ApprovalResult;
import com.example.ComplainSystem.dto.response.OrgApplicationResponse;
import com.example.ComplainSystem.entity.OrgApplication;
import com.example.ComplainSystem.entity.Organization;
import com.example.ComplainSystem.entity.User;
import com.example.ComplainSystem.repository.OrgApplicationRepository;
import com.example.ComplainSystem.repository.OrganizationRepository;
import com.example.ComplainSystem.repository.UserRepo;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class OrgApplicationService {

    private final OrgApplicationRepository appRepository;
    private final OrganizationRepository orgRepository;
    private final UserRepo userRepository;
    private final BCryptPasswordEncoder encoder;
    private final EmailService emailService;

    public OrgApplicationService(OrgApplicationRepository appRepository,
                                  OrganizationRepository orgRepository,
                                  UserRepo userRepository,
                                  BCryptPasswordEncoder encoder,
                                  EmailService emailService) {
        this.appRepository  = appRepository;
        this.orgRepository  = orgRepository;
        this.userRepository = userRepository;
        this.encoder        = encoder;
        this.emailService   = emailService;
    }

    public OrgApplicationResponse submit(OrgApplicationRequest request) {
        if (appRepository.existsByAdminEmailAndStatusIn(
                request.getAdminEmail(), java.util.List.of("PENDING", "APPROVED")))
            throw new RuntimeException("An application with this email already exists");

        if (userRepository.findByEmail(request.getAdminEmail()).isPresent())
            throw new RuntimeException("This email is already registered in the system");

        OrgApplication app = OrgApplication.builder()
                .organizationName(request.getOrganizationName())
                .organizationType(request.getOrganizationType())
                .adminName(request.getAdminName())
                .adminEmail(request.getAdminEmail())
                .phone(request.getPhone())
                .approxUsers(request.getApproxUsers())
                .message(request.getMessage())
                .build();

        OrgApplication saved = appRepository.save(app);

        // Send confirmation email to applicant
        emailService.sendApplicationConfirmation(
                saved.getAdminEmail(),
                saved.getAdminName(),
                saved.getOrganizationName()
        );

        return toResponse(saved);
    }

    public List<OrgApplicationResponse> getAll() {
        return appRepository.findAllByOrderByCreatedAtDesc()
                .stream().map(this::toResponse).toList();
    }

    public List<OrgApplicationResponse> getPending() {
        return appRepository.findByStatusOrderByCreatedAtDesc("PENDING")
                .stream().map(this::toResponse).toList();
    }

    public OrgApplicationStats getStats() {
        long pending  = appRepository.countByStatus("PENDING");
        long approved = appRepository.countByStatus("APPROVED");
        long rejected = appRepository.countByStatus("REJECTED");
        long approvedThisMonth = appRepository.countByStatusAndCreatedAtAfter(
                "APPROVED", LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0));
        return new OrgApplicationStats(pending, approved, rejected, approvedThisMonth);
    }

    @Transactional
    public ApprovalResult approve(Long applicationId) {
        OrgApplication app = appRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found"));

        if (!"PENDING".equals(app.getStatus()))
            throw new RuntimeException("Application is already " + app.getStatus());

        // 1. Generate slug from org name
        String baseSlug = app.getOrganizationName()
                .toLowerCase()
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("^-|-$", "");
        String slug = ensureUniqueSlug(baseSlug);

        // 2. Create organization
        String apiKey = UUID.randomUUID().toString().replace("-", "");
        Organization org = Organization.builder()
                .name(app.getOrganizationName())
                .slug(slug)
                .contactEmail(app.getAdminEmail())
                .status("ACTIVE")
                .apiKey(apiKey)
                .build();
        Organization savedOrg = orgRepository.save(org);

        // 3. Generate temporary password
        String tempPassword = generateTempPassword();

        // 4. Create ADMIN user
        User admin = User.builder()
                .name(app.getAdminName())
                .email(app.getAdminEmail())
                .password(encoder.encode(tempPassword))
                .role("ADMIN")
                .organizationId(savedOrg.getId())
                .build();
        userRepository.save(admin);

        // 5. Mark application as approved
        app.setStatus("APPROVED");
        appRepository.save(app);

        // 6. Send full onboarding email with credentials
        emailService.sendOrgApproval(
                app.getAdminEmail(),
                app.getAdminName(),
                savedOrg.getName(),
                savedOrg.getSlug(),
                tempPassword,
                apiKey
        );

        return new ApprovalResult(
                app.getAdminEmail(),
                tempPassword,
                savedOrg.getName(),
                savedOrg.getSlug(),
                apiKey
        );
    }

    public OrgApplicationResponse reject(Long applicationId, String reason) {
        OrgApplication app = appRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found"));

        if (!"PENDING".equals(app.getStatus()))
            throw new RuntimeException("Application is already " + app.getStatus());

        app.setStatus("REJECTED");
        app.setRejectionReason(reason != null && !reason.isBlank() ? reason.trim() : null);
        OrgApplicationResponse response = toResponse(appRepository.save(app));

        // Send rejection email with reason
        emailService.sendOrgRejection(
                app.getAdminEmail(),
                app.getAdminName(),
                app.getOrganizationName(),
                app.getRejectionReason()
        );

        return response;
    }

    private String ensureUniqueSlug(String base) {
        String slug = base;
        int i = 1;
        while (orgRepository.existsBySlug(slug)) {
            slug = base + "-" + i++;
        }
        return slug;
    }

    private String generateTempPassword() {
        String chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
        StringBuilder sb = new StringBuilder("Rh");
        for (int i = 0; i < 6; i++)
            sb.append(chars.charAt((int) (Math.random() * chars.length())));
        sb.append("!");
        return sb.toString();
    }

    private OrgApplicationResponse toResponse(OrgApplication app) {
        return new OrgApplicationResponse(
                app.getId(),
                app.getOrganizationName(),
                app.getOrganizationType(),
                app.getAdminName(),
                app.getAdminEmail(),
                app.getPhone(),
                app.getApproxUsers(),
                app.getMessage(),
                app.getStatus(),
                app.getRejectionReason(),
                app.getCreatedAt()
        );
    }

    public record OrgApplicationStats(long pending, long approved, long rejected, long approvedThisMonth) {}
}
