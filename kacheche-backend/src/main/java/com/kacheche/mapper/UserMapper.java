package com.kacheche.mapper;

import com.kacheche.dto.RoleSummaryResponse;
import com.kacheche.dto.UserRequest;
import com.kacheche.dto.UserResponse;
import com.kacheche.entity.Role;
import com.kacheche.entity.User;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Comparator;
import java.util.HashSet;
import java.util.Locale;
import java.util.Set;
import java.util.stream.Collectors;

@Component
public class UserMapper implements EntityMapper<User, UserRequest, UserResponse> {

    private final PasswordEncoder passwordEncoder;

    public UserMapper(PasswordEncoder passwordEncoder) {
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public User toEntity(UserRequest request) {

        User user = new User();

        user.setUsername(request.username().trim().toLowerCase(Locale.ROOT));
        user.setFullName(blankToNull(request.fullName()));
        user.setEmail(blankToNull(request.email()));
        user.setEnabled(request.enabled() == null || request.enabled());

        // Mot de passe haché dès ici : le clair ne circule pas plus loin.
        if (request.password() != null && !request.password().isBlank()) {
            user.setPassword(passwordEncoder.encode(request.password()));
        }

        // Un nouveau compte doit changer son mot de passe provisoire.
        user.setMustChangePassword(true);

        // Rôles : simples références, résolues par UserCommand.prepare().
        Set<Role> roles = request.roleIds().stream()
                .map(Role::new)
                .collect(Collectors.toCollection(HashSet::new));

        user.setRoles(roles);

        return user;
    }

    @Override
    public UserResponse toResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getUsername(),
                user.getFullName(),
                user.getEmail(),
                user.isEnabled(),
                user.isLocked(),
                user.isMustChangePassword(),
                user.getLastLoginAt(),
                user.getRoles().stream()
                        .sorted(Comparator.comparing(Role::getName))
                        .map(role -> new RoleSummaryResponse(role.getId(), role.getName()))
                        .toList(),
                user.getVersion()
        );
    }

    private static String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
