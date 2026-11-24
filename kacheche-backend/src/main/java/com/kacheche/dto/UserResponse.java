package com.kacheche.dto;

import java.time.Instant;
import java.util.List;

public record UserResponse(
        Long id,
        String username,
        String fullName,
        String email,
        boolean enabled,
        boolean locked,
        boolean mustChangePassword,
        Instant lastLoginAt,
        List<RoleSummaryResponse> roles,
        Long version
) {
}
