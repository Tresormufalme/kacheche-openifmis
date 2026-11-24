package com.kacheche.security;

public record PermissionDefinition(
        String code,
        String group,
        String description
) {
}
