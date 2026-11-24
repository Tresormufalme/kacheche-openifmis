package com.kacheche.repository;

import com.kacheche.entity.User;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface UserRepository extends BaseRepository<User> {

    @EntityGraph(attributePaths = "roles")
    Optional<User> findByUsernameIgnoreCase(String username);

    Optional<User> findByEmailIgnoreCase(String email);

    boolean existsByUsernameIgnoreCase(String username);

    boolean existsByEmailIgnoreCase(String email);

    @Override
    @EntityGraph(attributePaths = "roles")
    List<User> findAll();

    @Query("select count(u) from User u join u.roles r where r.id = :roleId")
    long countByRoleId(@Param("roleId") Long roleId);

    // Combien d'AUTRES administrateurs actifs existent (protection du dernier admin)
    @Query("select count(u) from User u join u.roles r "
            + "where r.name = :roleName and u.enabled = true and u.id <> :excludedId")
    long countOtherEnabledWithRole(
            @Param("roleName") String roleName,
            @Param("excludedId") Long excludedId);

    // ---- Compteurs de connexion : requêtes directes ----
    // Elles ne passent pas par l'entité : pas d'incrément de @Version
    // et pas de révision d'audit à chaque tentative de connexion.

    @Modifying
    @Query("update User u set u.failedAttempts = u.failedAttempts + 1 where u.id = :id")
    int incrementFailedAttempts(@Param("id") Long id);

    @Modifying
    @Query("update User u set u.lockedUntil = :until, u.failedAttempts = 0 where u.id = :id")
    int lock(@Param("id") Long id, @Param("until") Instant until);

    @Modifying
    @Query("update User u set u.failedAttempts = 0, u.lockedUntil = null, "
            + "u.lastLoginAt = :now where u.id = :id")
    int registerSuccessfulLogin(@Param("id") Long id, @Param("now") Instant now);
}
