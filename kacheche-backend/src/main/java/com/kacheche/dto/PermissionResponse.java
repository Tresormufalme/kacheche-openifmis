package com.kacheche.dto;

public record PermissionResponse(
        String code,
        String group,
        String description
) {
}
