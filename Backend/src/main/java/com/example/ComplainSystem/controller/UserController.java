package com.example.ComplainSystem.controller;

import com.example.ComplainSystem.dto.request.ChangePasswordRequest;
import com.example.ComplainSystem.dto.request.LoginRequest;
import com.example.ComplainSystem.dto.request.RoleUpdateRequest;
import com.example.ComplainSystem.dto.request.UserRequest;
import com.example.ComplainSystem.dto.response.ApiResponse;
import com.example.ComplainSystem.dto.response.UserResponse;
import com.example.ComplainSystem.services.UserService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    public ApiResponse<UserResponse> register(@Valid @RequestBody UserRequest request) {
        return new ApiResponse<>("success", userService.register(request));
    }

    @PostMapping("/login")
    public ApiResponse<String> login(@Valid @RequestBody LoginRequest request) {
        return new ApiResponse<>("success", userService.login(request));
    }

    /** ADMIN gets their scoped users; SUPER_ADMIN gets all */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN')")
    public ApiResponse<List<UserResponse>> getUsers(Authentication auth) {
        return new ApiResponse<>("success", userService.getUsersForCaller(auth.getName()));
    }

    @GetMapping("/admins")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ApiResponse<List<UserResponse>> getAllAdmins() {
        return new ApiResponse<>("success", userService.getAllAdmins());
    }

    @GetMapping("/stats")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ApiResponse<UserService.DashboardStats> getStats() {
        return new ApiResponse<>("success", userService.getSuperAdminStats());
    }

    @PutMapping("/change-password")
    public ApiResponse<String> changePassword(@Valid @RequestBody ChangePasswordRequest request,
                                              Authentication auth) {
        userService.changePassword(auth.getName(), request);
        return new ApiResponse<>("success", "Password changed successfully");
    }

    @PutMapping("/{id}/role")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN')")
    public ApiResponse<UserResponse> updateRole(@PathVariable Long id,
                                                @Valid @RequestBody RoleUpdateRequest request,
                                                Authentication auth) {
        return new ApiResponse<>("success", userService.updateRole(id, request, auth.getName()));
    }

    @PostMapping("/managed")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN')")
    public ApiResponse<UserResponse> createManagedUser(
            @Valid @RequestBody UserRequest request,
            @RequestParam String role,
            Authentication auth) {
        return new ApiResponse<>("success", userService.createManagedUser(request, role.toUpperCase(), auth.getName()));
    }

    @DeleteMapping("/managed/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN')")
    public ApiResponse<String> deleteManagedUser(@PathVariable Long id, Authentication auth) {
        userService.deleteManagedUser(id, auth.getName());
        return new ApiResponse<>("success", "User deleted successfully");
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ApiResponse<String> deleteUser(@PathVariable Long id, Authentication auth) {
        userService.deleteUser(id, auth.getName());
        return new ApiResponse<>("success", "User deleted successfully");
    }
}
