package com.example.ComplainSystem.services;

import com.example.ComplainSystem.dto.request.ChangePasswordRequest;
import com.example.ComplainSystem.dto.request.LoginRequest;
import com.example.ComplainSystem.dto.request.RoleUpdateRequest;
import com.example.ComplainSystem.dto.request.UserRequest;
import com.example.ComplainSystem.dto.response.UserResponse;
import com.example.ComplainSystem.entity.User;
import com.example.ComplainSystem.repository.UserRepo;
import com.example.ComplainSystem.util.JwtUtil;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

@Service
public class UserService {

    private final UserRepo userRepository;
    private final BCryptPasswordEncoder encoder;
    private final JwtUtil jwtUtil;
    private final com.example.ComplainSystem.repository.OrganizationRepository orgRepository;
    private final EmailService emailService;

    public UserService(UserRepo userRepository, BCryptPasswordEncoder encoder,
                       JwtUtil jwtUtil,
                       com.example.ComplainSystem.repository.OrganizationRepository orgRepository,
                       EmailService emailService) {
        this.userRepository  = userRepository;
        this.encoder         = encoder;
        this.jwtUtil         = jwtUtil;
        this.orgRepository   = orgRepository;
        this.emailService    = emailService;
    }

    public UserResponse register(UserRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }
        // Auto-assign to default org so the user is visible to their admin
        Long defaultOrgId = orgRepository.findBySlug("resolvehub-demo")
                .map(org -> org.getId()).orElse(null);
        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .role("USER")
                .password(encoder.encode(request.getPassword()))
                .organizationId(defaultOrgId)
                .build();
        return toResponse(userRepository.save(user));
    }

    /** ADMIN creates a user/staff and auto-links them via managedByAdminId + organizationId */
    public UserResponse createManagedUser(UserRequest request, String role, String adminEmail) {
        if (userRepository.findByEmail(request.getEmail()).isPresent())
            throw new RuntimeException("Email already exists");
        if (!"USER".equals(role) && !"STAFF".equals(role))
            throw new RuntimeException("ADMIN can only create USER or STAFF accounts");
        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new RuntimeException("Admin not found"));
        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(encoder.encode(request.getPassword()))
                .role(role)
                .managedByAdminId(admin.getId())
                .organizationId(admin.getOrganizationId())
                .build();
        User saved = userRepository.save(user);

        // Send welcome email with login credentials
        emailService.sendManagedUserWelcome(
                saved.getEmail(),
                saved.getName(),
                saved.getRole(),
                request.getPassword(),   // plain password before encoding
                admin.getName()
        );

        return toResponse(saved);
    }

    /** ADMIN deletes a user they manage */
    public void deleteManagedUser(Long targetId, String adminEmail) {
        User target = userRepository.findById(targetId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (target.isSeededAdmin())
            throw new RuntimeException("Seeded accounts cannot be deleted");
        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new RuntimeException("Admin not found"));
        if ("SUPER_ADMIN".equals(admin.getRole())) {
            userRepository.delete(target);
            return;
        }
        if (!admin.getId().equals(target.getManagedByAdminId()))
            throw new RuntimeException("You can only delete users under your administration");
        userRepository.delete(target);
    }

    public String login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (!encoder.matches(request.getPassword(), user.getPassword()))
            throw new RuntimeException("Invalid password");
        return jwtUtil.generateToken(user.getEmail(), user.getRole(), user.isSeededAdmin(), user.getName());
    }

    /** ADMIN sees users in their org + users they directly manage. SUPER_ADMIN sees all. */
    public List<UserResponse> getUsersForCaller(String callerEmail) {
        User caller = userRepository.findByEmail(callerEmail)
                .orElseThrow(() -> new RuntimeException("Caller not found"));

        if ("SUPER_ADMIN".equals(caller.getRole())) {
            return userRepository.findAll().stream().map(this::toResponse).collect(Collectors.toList());
        }

        // ADMIN: union of org-scoped users + directly managed users (covers null-org self-registrations)
        java.util.Set<Long> seen = new java.util.HashSet<>();
        java.util.List<UserResponse> result = new java.util.ArrayList<>();

        if (caller.getOrganizationId() != null) {
            userRepository.findByOrganizationId(caller.getOrganizationId())
                    .stream()
                    .filter(u -> !u.getId().equals(caller.getId())) // exclude self
                    .forEach(u -> { if (seen.add(u.getId())) result.add(toResponse(u)); });
        }

        userRepository.findByManagedByAdminId(caller.getId())
                .forEach(u -> { if (seen.add(u.getId())) result.add(toResponse(u)); });

        return result;
    }

    /** Legacy — kept for backward compat, returns all (used by SUPER_ADMIN endpoints) */
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<UserResponse> getAllAdmins() {
        return userRepository.findByRole("ADMIN").stream().map(this::toResponse).collect(Collectors.toList());
    }

    public UserResponse updateRole(Long targetId, RoleUpdateRequest request, String callerEmail) {
        if (!request.isRoleValid())
            throw new RuntimeException("Invalid role. Allowed: USER, STAFF, ADMIN, SUPER_ADMIN");

        User target = userRepository.findById(targetId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (target.isSeededAdmin())
            throw new RuntimeException("The seeded account cannot be modified");

        User caller = userRepository.findByEmail(callerEmail)
                .orElseThrow(() -> new RuntimeException("Caller not found"));

        String newRole = request.getRole().toUpperCase(Locale.ROOT);

        if ("ADMIN".equals(caller.getRole())) {
            // ADMIN can only manage their own scoped users
            if (target.getManagedByAdminId() == null || !target.getManagedByAdminId().equals(caller.getId()))
                throw new RuntimeException("You can only manage users under your administration");
            if ("ADMIN".equals(target.getRole()) || "SUPER_ADMIN".equals(newRole))
                throw new RuntimeException("ADMINs cannot promote to ADMIN or SUPER_ADMIN");
        }

        target.setRole(newRole);
        return toResponse(userRepository.save(target));
    }

    public void deleteUser(Long targetId, String callerEmail) {
        User target = userRepository.findById(targetId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (target.isSeededAdmin())
            throw new RuntimeException("The seeded account cannot be deleted");
        User caller = userRepository.findByEmail(callerEmail)
                .orElseThrow(() -> new RuntimeException("Caller not found"));
        if (!"SUPER_ADMIN".equals(caller.getRole()))
            throw new RuntimeException("Only SUPER_ADMIN can delete users");
        userRepository.delete(target);
    }

    public void changePassword(String callerEmail, ChangePasswordRequest request) {
        User user = userRepository.findByEmail(callerEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!encoder.matches(request.getCurrentPassword(), user.getPassword()))
            throw new RuntimeException("Current password is incorrect");

        if (request.getCurrentPassword().equals(request.getNewPassword()))
            throw new RuntimeException("New password must be different from the current password");

        user.setPassword(encoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    public DashboardStats getSuperAdminStats() {
        long totalUsers  = userRepository.findByRole("USER").size();
        long totalAdmins = userRepository.findByRole("ADMIN").size();
        long totalStaff  = userRepository.findByRole("STAFF").size();
        long total       = userRepository.count();
        return new DashboardStats(total, totalAdmins, totalStaff, totalUsers);
    }

    private UserResponse toResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .seededAdmin(user.isSeededAdmin())
                .managedByAdminId(user.getManagedByAdminId())
                .organizationId(user.getOrganizationId())
                .build();
    }

    public record DashboardStats(long total, long admins, long staff, long users) {}
}
