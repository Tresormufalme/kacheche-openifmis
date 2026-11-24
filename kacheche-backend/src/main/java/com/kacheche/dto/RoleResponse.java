package com.kacheche.dto;

import java.util.List;

public record RoleResponse(
        Long id,
        String name,
        String description,
        boolean systemRole,
        List<String> permissions,
        Long version
) {
}
