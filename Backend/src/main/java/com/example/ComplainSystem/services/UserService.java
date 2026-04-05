package com.example.ComplainSystem.services;

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
import java.util.stream.Collectors;

@Service
public class UserService {

    private final UserRepo userRepository;
    private final BCryptPasswordEncoder encoder;
    private final JwtUtil jwtUtil;

    public UserService(UserRepo userRepository, BCryptPasswordEncoder encoder, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.encoder = encoder;
        this.jwtUtil = jwtUtil;
    }

    public UserResponse register(UserRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .role("USER")
                .password(encoder.encode(request.getPassword()))
                .build();

        return toResponse(userRepository.save(user));
    }

    public String login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!encoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid password");
        }

        return jwtUtil.generateToken(user.getEmail(), user.getRole());
    }

    public UserResponse updateRole(Long id, RoleUpdateRequest request) {
        if (!request.isRoleValid()) {
            throw new RuntimeException("Invalid role. Allowed values: USER, STAFF, ADMIN");
        }

        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setRole(request.getRole().toUpperCase());
        return toResponse(userRepository.save(user));
    }

    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    private UserResponse toResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .build();
    }
}
