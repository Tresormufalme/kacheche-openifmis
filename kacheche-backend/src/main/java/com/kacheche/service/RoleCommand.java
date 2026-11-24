package com.kacheche.service;

import com.kacheche.dto.RoleRequest;
import com.kacheche.entity.Role;
import com.kacheche.exception.DuplicateResourceException;
import com.kacheche.mapper.RoleMapper;
import com.kacheche.repository.RoleRepository;
import com.kacheche.repository.UserRepository;
import com.kacheche.security.Permissions;
import com.kacheche.security.RoleNames;
import org.springframework.stereotype.Service;

@Service
public class RoleCommand extends BaseCommand<Role, RoleRequest, RoleRepository> {

    private final UserRepository userRepository;

    public RoleCommand(final RoleRepository repository,
                       final RoleMapper mapper,
                       final UserRepository userRepository) {
        super(repository, mapper, "Rôle");
        this.userRepository = userRepository;
    }

    @Override
    protected void prepare(Role role) {
        role.getPermissions().forEach(code -> {
            if (!Permissions.isValid(code)) {
                throw new IllegalArgumentException("Permission inconnue : " + code);
            }
        });
    }

    @Override
    protected void validateCreate(Role role) {
        if (repository.existsByNameIgnoreCase(role.getName())) {
            throw new DuplicateResourceException("Un rôle portant ce nom existe déjà.");
        }
    }

    @Override
    protected void validateUpdate(Role existing, Role incoming) {

        if (existing.isSystemRole() && !existing.getName().equals(incoming.getName())) {
            throw new IllegalArgumentException(
                    "Le nom d’un rôle système ne peut pas être modifié.");
        }

        repository.findByName(incoming.getName())
                .filter(found -> !found.getId().equals(existing.getId()))
                .ifPresent(found -> {
                    throw new DuplicateResourceException(
                            "Un autre rôle porte déjà ce nom.");
                });

        if (RoleNames.ADMIN.equals(existing.getName())
                && !incoming.getPermissions().containsAll(Permissions.codes())) {
            throw new IllegalArgumentException(
                    "Le rôle ADMIN doit conserver toutes les permissions.");
        }
    }

    @Override
    protected void copy(Role target, Role source) {
        target.setName(source.getName());
        target.setDescription(source.getDescription());
        target.getPermissions().clear();
        target.getPermissions().addAll(source.getPermissions());
    }

    @Override
    public void delete(Long id) {

        Role role = getOrThrow(id);

        if (role.isSystemRole()) {
            throw new IllegalStateException("Un rôle système ne peut pas être supprimé.");
        }

        long users = userRepository.countByRoleId(id);

        if (users > 0) {
            throw new IllegalStateException(
                    "Ce rôle est attribué à " + users + " utilisateur(s). "
                            + "Retirez-le de ces comptes avant de le supprimer.");
        }

        repository.delete(role);
    }
}
