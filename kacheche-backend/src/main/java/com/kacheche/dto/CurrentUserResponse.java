package com.kacheche.dto;

import com.kacheche.security.AppUserDetails;

import java.util.List;

public record CurrentUserResponse(
        Long id,
        String username,
        String fullName,
        String email,
        boolean mustChangePassword,
        List<String> roles,
        List<String> permissions
) {

    public static CurrentUserResponse from(AppUserDetails user) {
        return new CurrentUserResponse(
                user.getId(),
                user.getUsername(),
                user.getFullName(),
                user.getEmail(),
                user.isMustChangePassword(),
                user.getRoles(),
                List.copyOf(user.getPermissions())
        );
    }
}
