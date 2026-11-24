package com.kacheche.mapper;

import com.kacheche.dto.RoleRequest;
import com.kacheche.dto.RoleResponse;
import com.kacheche.entity.Role;
import org.springframework.stereotype.Component;

import java.util.Locale;

@Component
public class RoleMapper implements EntityMapper<Role, RoleRequest, RoleResponse> {

    @Override
    public Role toEntity(RoleRequest request) {

        String description = request.description() == null || request.description().isBlank()
                ? null
                : request.description().trim();

        return new Role(
                request.name().trim().toUpperCase(Locale.ROOT),
                description,
                request.permissions()
        );
    }

    @Override
    public RoleResponse toResponse(Role role) {
        return new RoleResponse(
                role.getId(),
                role.getName(),
                role.getDescription(),
                role.isSystemRole(),
                role.getPermissions().stream().sorted().toList(),
                role.getVersion()
        );
    }
}
