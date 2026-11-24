package com.kacheche.service;

import com.kacheche.dto.UserRequest;
import com.kacheche.entity.Role;
import com.kacheche.entity.User;
import com.kacheche.exception.DuplicateResourceException;
import com.kacheche.exception.ResourceNotFoundException;
import com.kacheche.mapper.UserMapper;
import com.kacheche.repository.RoleRepository;
import com.kacheche.repository.UserRepository;
import com.kacheche.security.CurrentUser;
import com.kacheche.security.RefreshTokenService;
import com.kacheche.security.RoleNames;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class UserCommand extends BaseCommand<User, UserRequest, UserRepository> {

    private final RoleRepository roleRepository;
    private final RefreshTokenService refreshTokenService;
    private final PasswordEncoder passwordEncoder;

    public UserCommand(final UserRepository repository,
                       final UserMapper mapper,
                       final RoleRepository roleRepository,
                       final RefreshTokenService refreshTokenService,
                       final PasswordEncoder passwordEncoder) {
        super(repository, mapper, "Utilisateur");
        this.roleRepository = roleRepository;
        this.refreshTokenService = refreshTokenService;
        this.passwordEncoder = passwordEncoder;
    }

    // ---------- HOOKS ----------

    // Remplace les références de rôles (ids) par les vrais rôles en base.
    @Override
    protected void prepare(User user) {

        Set<Long> ids = user.getRoles().stream()
                .map(Role::getId)
                .collect(Collectors.toSet());

        List<Role> found = roleRepository.findAllById(ids);

        if (found.size() != ids.size()) {
            throw new ResourceNotFoundException("Un des rôles demandés est introuvable.");
        }

        user.setRoles(new HashSet<>(found));
    }

    @Override
    protected void validateCreate(User user) {

        if (user.getPassword() == null) {
            throw new IllegalArgumentException(
                    "Le mot de passe est obligatoire à la création d’un utilisateur.");
        }

        if (repository.existsByUsernameIgnoreCase(user.getUsername())) {
            throw new DuplicateResourceException("Ce nom d’utilisateur existe déjà.");
        }

        if (user.getEmail() != null && repository.existsByEmailIgnoreCase(user.getEmail())) {
            throw new DuplicateResourceException("Cette adresse e-mail est déjà utilisée.");
        }
    }

    @Override
    protected void validateUpdate(User existing, User incoming) {

        if (!existing.getUsername().equalsIgnoreCase(incoming.getUsername())) {
            throw new IllegalArgumentException(
                    "Le nom d’utilisateur ne peut pas être modifié.");
        }

        if (incoming.getEmail() != null) {
            repository.findByEmailIgnoreCase(incoming.getEmail())
                    .filter(found -> !found.getId().equals(existing.getId()))
                    .ifPresent(found -> {
                        throw new DuplicateResourceException(
                                "Cette adresse e-mail est déjà utilisée.");
                    });
        }

        boolean wasAdmin = hasAdminRole(existing);
        boolean staysAdmin = hasAdminRole(incoming) && incoming.isEnabled();

        if (CurrentUser.isUsername(existing.getUsername())) {

            if (!incoming.isEnabled()) {
                throw new IllegalStateException(
                        "Vous ne pouvez pas désactiver votre propre compte.");
            }

            if (wasAdmin && !hasAdminRole(incoming)) {
                throw new IllegalStateException(
                        "Vous ne pouvez pas retirer votre propre rôle d’administrateur.");
            }
        }

        if (wasAdmin && existing.isEnabled() && !staysAdmin) {
            ensureAnotherAdmin(existing.getId());
        }
    }

    @Override
    protected void copy(User target, User source) {
        target.setFullName(source.getFullName());
        target.setEmail(source.getEmail());
        target.setEnabled(source.isEnabled());
        target.getRoles().clear();
        target.getRoles().addAll(source.getRoles());
    }

    // ---------- COMMANDES ----------

    @Override
    public void update(Long id, UserRequest request) {
        super.update(id, request);

        // Compte désactivé : toutes ses sessions sont coupées immédiatement.
        if (Boolean.FALSE.equals(request.enabled())) {
            refreshTokenService.revokeAllForUser(id);
        }
    }

    @Override
    public void delete(Long id) {

        User user = getOrThrow(id);

        if (CurrentUser.isUsername(user.getUsername())) {
            throw new IllegalStateException("Vous ne pouvez pas supprimer votre propre compte.");
        }

        if (hasAdminRole(user) && user.isEnabled()) {
            ensureAnotherAdmin(id);
        }

        refreshTokenService.deleteAllForUser(id);
        repository.delete(user);
    }

    // Réinitialisation par un administrateur : mot de passe provisoire.
    public void resetPassword(Long id, String newPassword) {

        User user = getOrThrow(id);

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setMustChangePassword(true);
        user.setFailedAttempts(0);
        user.setLockedUntil(null);

        repository.saveAndFlush(user);

        refreshTokenService.revokeAllForUser(id);
    }

    // ---------- PRIVÉ ----------

    private boolean hasAdminRole(User user) {
        return user.getRoles().stream()
                .anyMatch(role -> RoleNames.ADMIN.equals(role.getName()));
    }

    // Garantit qu'il reste toujours au moins un administrateur actif.
    private void ensureAnotherAdmin(Long excludedUserId) {
        if (repository.countOtherEnabledWithRole(RoleNames.ADMIN, excludedUserId) == 0) {
            throw new IllegalStateException(
                    "Opération refusée : il doit rester au moins un administrateur actif.");
        }
    }
}
