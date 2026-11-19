package com.kacheche.dto;

public record DepartmentResponse(
        Long id,
        String name,
        String code,
        String description,
        Long version
) {
}
