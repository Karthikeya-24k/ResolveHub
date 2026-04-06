package com.example.ComplainSystem.dto.request;

import lombok.Data;
import java.util.Locale;
import java.util.Set;

@Data
public class RoleUpdateRequest {

    private String role;

    private static final Set<String> ALLOWED_ROLES = Set.of("USER", "STAFF", "ADMIN");

    public boolean isRoleValid() {
        return role != null && ALLOWED_ROLES.contains(role.toUpperCase(Locale.ROOT));
    }
}
