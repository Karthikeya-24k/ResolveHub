package com.example.ComplainSystem.controller;

import com.example.ComplainSystem.dto.request.LoginRequest;
import com.example.ComplainSystem.dto.request.RoleUpdateRequest;
import com.example.ComplainSystem.dto.request.UserRequest;
import com.example.ComplainSystem.dto.response.ApiResponse;
import com.example.ComplainSystem.dto.response.UserResponse;
import com.example.ComplainSystem.services.UserService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<List<UserResponse>> getAllUsers() {
        return new ApiResponse<>("success", userService.getAllUsers());
    }

    @PostMapping("/register")
    public ApiResponse<UserResponse> register(@RequestBody UserRequest request) {
        return new ApiResponse<>("success", userService.register(request));
    }

    @PostMapping("/login")
    public ApiResponse<String> login(@RequestBody LoginRequest request) {
        return new ApiResponse<>("success", userService.login(request));
    }

    @PutMapping("/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<UserResponse> updateRole(@PathVariable Long id,
                                                @RequestBody RoleUpdateRequest request) {
        return new ApiResponse<>("success", userService.updateRole(id, request));
    }
}
