package com.kacheche.security;

import com.kacheche.entity.Role;
import com.kacheche.entity.User;
import com.kacheche.repository.RoleRepository;
import com.kacheche.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Initialisation au démarrage (idempotente) :
 *  - crée les rôles système ADMIN, COMPTABLE et AUDITEUR s'ils n'existent pas ;
 *  - garantit que ADMIN possède toutes les permissions du catalogue
 *    (une nouvelle permission est donc automatiquement donnée à ADMIN) ;
 *  - crée les comptes "admin" et "comptable" s'ils n'existent pas.
 * Les rôles COMPTABLE et AUDITEUR, une fois créés, sont librement modifiables.
 */
@Component
public class DataInitializer implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final TransactionTemplate transactionTemplate;
    private final String adminPassword;
    private final String comptablePassword;

    public DataInitializer(
            RoleRepository roleRepository,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            PlatformTransactionManager transactionManager,
            @Value("${app.security.admin-password}") String adminPassword,
            @Value("${app.security.comptable-password}") String comptablePassword) {

        this.roleRepository = roleRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.transactionTemplate = new TransactionTemplate(transactionManager);
        this.adminPassword = adminPassword;
        this.comptablePassword = comptablePassword;
    }

    @Override
    public void run(ApplicationArguments args) {

        // L'audit enregistre l'auteur des révisions : ici, "system".
        // Le contexte doit rester actif jusqu'au commit (c'est là que la révision est créée).
        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(
                UsernamePasswordAuthenticationToken.authenticated("system", null, List.of()));
        SecurityContextHolder.setContext(context);

        try {
            transactionTemplate.executeWithoutResult(status -> seed());
        } finally {
            SecurityContextHolder.clearContext();
        }
    }

    private void seed() {

        Role admin = ensureRole(
                RoleNames.ADMIN,
                "Accès complet à l’application",
                Permissions.codes());

        // Toujours aligné sur le catalogue complet
        if (!admin.getPermissions().containsAll(Permissions.codes())) {
            admin.getPermissions().addAll(Permissions.codes());
            roleRepository.save(admin);
        }

        Role comptable = ensureRole(
                RoleNames.COMPTABLE,
                "Consulte les données et enregistre des dépenses",
                Set.of(
                        Permissions.DASHBOARD_READ,
                        Resource.DEPARTMENT.permission(Action.READ),
                        Resource.BUDGET.permission(Action.READ),
                        Resource.EXPENSE.permission(Action.READ),
                        Resource.EXPENSE.permission(Action.CREATE),
                        Resource.EXPENSE.permission(Action.UPDATE)
                ));

        ensureRole(
                RoleNames.AUDITEUR,
                "Lecture seule et consultation de l’audit trail",
                Permissions.codes().stream()
                        .filter(code -> code.endsWith("_READ"))
                        .filter(code -> !code.startsWith("USER_") && !code.startsWith("ROLE_"))
                        .collect(Collectors.toSet()));

        ensureUser("admin", adminPassword, "Administrateur", admin);
        ensureUser("comptable", comptablePassword, "Comptable", comptable);
    }

    private Role ensureRole(String name, String description, Set<String> permissions) {

        return roleRepository.findByName(name).orElseGet(() -> {

            Role role = new Role(name, description, permissions);
            role.setSystemRole(true);

            log.info("Création du rôle système {}", name);

            return roleRepository.save(role);
        });
    }

    private void ensureUser(String username, String password, String fullName, Role role) {

        if (userRepository.existsByUsernameIgnoreCase(username)) {
            return;
        }

        User user = new User();
        user.setUsername(username);
        user.setPassword(passwordEncoder.encode(password));
        user.setFullName(fullName);
        user.setEnabled(true);
        user.setMustChangePassword(false);
        user.setRoles(new HashSet<>(Set.of(role)));

        userRepository.save(user);

        log.info("Création du compte initial « {} »", username);
    }
}
