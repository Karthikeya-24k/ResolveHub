package com.example.ComplainSystem.config;

import com.example.ComplainSystem.entity.Organization;
import com.example.ComplainSystem.entity.User;
import com.example.ComplainSystem.repository.IssueRepo;
import com.example.ComplainSystem.repository.OrganizationRepository;
import com.example.ComplainSystem.repository.UserRepo;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class AdminSeeder implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminSeeder.class);

    private final UserRepo userRepo;
    private final OrganizationRepository orgRepo;
    private final IssueRepo issueRepo;
    private final BCryptPasswordEncoder encoder;

    public AdminSeeder(UserRepo userRepo, OrganizationRepository orgRepo,
                       IssueRepo issueRepo, BCryptPasswordEncoder encoder) {
        this.userRepo  = userRepo;
        this.orgRepo   = orgRepo;
        this.issueRepo = issueRepo;
        this.encoder   = encoder;
    }

    @Override
    public void run(ApplicationArguments args) {
        // 1. Seed SUPER_ADMIN (no org)
        if (userRepo.findByEmail("superadmin@resolvehub.com").isEmpty()) {
            userRepo.save(User.builder()
                    .name("Super Admin")
                    .email("superadmin@resolvehub.com")
                    .password(encoder.encode("R#9vX$2mKqL@7nPw"))
                    .role("SUPER_ADMIN")
                    .seededAdmin(true)
                    .build());
            log.info("Seeded SUPER_ADMIN account.");
        }

        // 2. Seed default organization
        Organization defaultOrg = orgRepo.findBySlug("resolvehub-demo")
                .orElseGet(() -> {
                    Organization org = Organization.builder()
                            .name("ResolveHub Demo Org")
                            .slug("resolvehub-demo")
                            .contactEmail("admin@mail.com")
                            .status("ACTIVE")
                            .apiKey(UUID.randomUUID().toString().replace("-", ""))
                            .build();
                    Organization saved = orgRepo.save(org);
                    log.info("Seeded default organization: ResolveHub Demo Org");
                    return saved;
                });

        // 3. Seed default ADMIN assigned to default org
        if (userRepo.findByEmail("admin@mail.com").isEmpty()) {
            userRepo.save(User.builder()
                    .name("Admin")
                    .email("admin@mail.com")
                    .password(encoder.encode("T@4jW#8zYcN$3hQe"))
                    .role("ADMIN")
                    .seededAdmin(true)
                    .organizationId(defaultOrg.getId())
                    .build());
            log.info("Seeded default ADMIN account in ResolveHub Demo Org.");
        } else {
            userRepo.findByEmail("admin@mail.com").ifPresent(admin -> {
                if (admin.getOrganizationId() == null) {
                    admin.setOrganizationId(defaultOrg.getId());
                    userRepo.save(admin);
                    log.info("Migrated existing admin to default org.");
                }
            });
        }

        // 4. Migrate all existing users (non-SUPER_ADMIN) with null organizationId
        //    to the default org so their issues become visible
        Long defaultOrgId = defaultOrg.getId();
        int migratedUsers = 0;
        for (User user : userRepo.findAll()) {
            if (user.getOrganizationId() == null && !"SUPER_ADMIN".equals(user.getRole())) {
                user.setOrganizationId(defaultOrgId);
                userRepo.save(user);
                migratedUsers++;
            }
        }
        if (migratedUsers > 0) log.info("Migrated {} users to default org.", migratedUsers);

        // 5. Migrate all existing issues with null organizationId to the default org
        int migratedIssues = 0;
        for (var issue : issueRepo.findAll()) {
            if (issue.getOrganizationId() == null) {
                issue.setOrganizationId(defaultOrgId);
                issueRepo.save(issue);
                migratedIssues++;
            }
        }
        if (migratedIssues > 0) log.info("Migrated {} issues to default org.", migratedIssues);
    }
}
