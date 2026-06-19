package com.example.ComplainSystem.services;

import com.example.ComplainSystem.dto.request.ExternalLoginRequest;
import com.example.ComplainSystem.dto.request.OrganizationRequest;
import com.example.ComplainSystem.dto.response.OrganizationResponse;
import com.example.ComplainSystem.entity.Organization;
import com.example.ComplainSystem.entity.User;
import com.example.ComplainSystem.repository.OrganizationRepository;
import com.example.ComplainSystem.repository.UserRepo;
import com.example.ComplainSystem.util.JwtUtil;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class OrganizationService {

    private final OrganizationRepository orgRepository;
    private final UserRepo userRepository;
    private final JwtUtil jwtUtil;

    public OrganizationService(OrganizationRepository orgRepository,
                                UserRepo userRepository,
                                JwtUtil jwtUtil) {
        this.orgRepository  = orgRepository;
        this.userRepository = userRepository;
        this.jwtUtil        = jwtUtil;
    }

    public List<OrganizationResponse> getAllOrganizations() {
        return orgRepository.findAll().stream().map(this::toResponse).toList();
    }

    public OrganizationResponse getById(Long id) {
        return toResponse(orgRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Organization not found")));
    }

    /** ADMIN fetches their own organization details including API key */
    public OrganizationResponse getMyOrganization(String adminEmail) {
        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (admin.getOrganizationId() == null)
            throw new RuntimeException("You are not assigned to any organization");
        Organization org = orgRepository.findById(admin.getOrganizationId())
                .orElseThrow(() -> new RuntimeException("Organization not found"));
        return toResponse(org);
    }

    public OrganizationResponse create(OrganizationRequest request) {
        if (orgRepository.existsBySlug(request.getSlug()))
            throw new RuntimeException("Slug '" + request.getSlug() + "' is already taken");

        Organization org = Organization.builder()
                .name(request.getName())
                .slug(request.getSlug().toLowerCase().replaceAll("[^a-z0-9-]", "-"))
                .contactEmail(request.getContactEmail())
                .status("ACTIVE")
                .apiKey(UUID.randomUUID().toString().replace("-", ""))
                .build();

        return toResponse(orgRepository.save(org));
    }

    public OrganizationResponse updateStatus(Long id, String status) {
        Organization org = orgRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Organization not found"));
        org.setStatus(status.toUpperCase());
        return toResponse(orgRepository.save(org));
    }

    public OrganizationResponse regenerateApiKey(Long id) {
        Organization org = orgRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Organization not found"));
        org.setApiKey(UUID.randomUUID().toString().replace("-", ""));
        return toResponse(orgRepository.save(org));
    }

    public void delete(Long id) {
        Organization org = orgRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Organization not found"));
        orgRepository.delete(org);
    }

    public String externalLogin(String apiKey, ExternalLoginRequest request) {
        Organization org = orgRepository.findByApiKey(apiKey)
                .orElseThrow(() -> new RuntimeException("Invalid API key"));

        if (!"ACTIVE".equals(org.getStatus()))
            throw new RuntimeException("Organization is not active");

        User user = userRepository.findByEmail(request.getEmail())
                .orElseGet(() -> {
                    User newUser = User.builder()
                            .name(request.getName())
                            .email(request.getEmail())
                            .password("")
                            .role("USER")
                            .organizationId(org.getId())
                            .build();
                    return userRepository.save(newUser);
                });

        if (user.getOrganizationId() == null) {
            user.setOrganizationId(org.getId());
            userRepository.save(user);
        }

        return jwtUtil.generateToken(user.getEmail(), user.getRole(), user.isSeededAdmin(), user.getName());
    }

    private OrganizationResponse toResponse(Organization org) {
        // Find the ADMIN assigned to this org
        Optional<User> admin = userRepository.findByOrganizationId(org.getId())
                .stream()
                .filter(u -> "ADMIN".equals(u.getRole()))
                .findFirst();

        return new OrganizationResponse(
                org.getId(),
                org.getName(),
                org.getSlug(),
                org.getContactEmail(),
                org.getStatus(),
                org.getApiKey(),
                org.getCreatedAt(),
                admin.map(User::getName).orElse(null),
                admin.map(User::getEmail).orElse(null)
        );
    }
}
