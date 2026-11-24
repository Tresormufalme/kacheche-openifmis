package com.kacheche.security;

import com.kacheche.entity.RefreshToken;
import com.kacheche.entity.User;
import com.kacheche.repository.RefreshTokenRepository;
import com.kacheche.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import java.util.HexFormat;

/**
 * Jetons de rafraîchissement : aléatoires, hachés en base, à usage unique (rotation).
 * Réutiliser un jeton déjà consommé révoque toutes les sessions de l'utilisateur
 * (signe probable de vol de jeton).
 */
@Service
public class RefreshTokenService {

    public record Rotation(User user, String refreshToken) {
    }

    private final RefreshTokenRepository repository;
    private final UserRepository userRepository;
    private final long validityDays;
    private final SecureRandom random = new SecureRandom();

    public RefreshTokenService(
            RefreshTokenRepository repository,
            UserRepository userRepository,
            @Value("${app.security.jwt.refresh-token-days:7}") long validityDays) {

        this.repository = repository;
        this.userRepository = userRepository;
        this.validityDays = validityDays;
    }

    @Transactional
    public String issue(Long userId) {

        repository.deleteExpired(Instant.now());

        byte[] bytes = new byte[32];
        random.nextBytes(bytes);

        String raw = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);

        repository.save(new RefreshToken(
                hash(raw),
                userRepository.getReferenceById(userId),
                Instant.now().plus(validityDays, ChronoUnit.DAYS)
        ));

        return raw;
    }

    @Transactional(noRollbackFor = BadCredentialsException.class)
    public Rotation rotate(String rawToken) {

        RefreshToken token = repository.findByTokenHash(hash(rawToken))
                .orElseThrow(() -> new BadCredentialsException(
                        "Session invalide. Veuillez vous reconnecter."));

        if (token.isRevoked()) {
            repository.revokeAllByUserId(token.getUser().getId());
            throw new BadCredentialsException(
                    "Session invalide. Veuillez vous reconnecter.");
        }

        if (token.getExpiresAt().isBefore(Instant.now())) {
            throw new BadCredentialsException(
                    "Votre session a expiré. Veuillez vous reconnecter.");
        }

        User user = token.getUser();

        if (!user.isEnabled() || user.isLocked()) {
            throw new BadCredentialsException(
                    "Ce compte n’est plus autorisé à se connecter.");
        }

        token.setRevoked(true);

        return new Rotation(user, issue(user.getId()));
    }

    @Transactional
    public void revoke(String rawToken) {
        repository.findByTokenHash(hash(rawToken))
                .ifPresent(token -> token.setRevoked(true));
    }

    @Transactional
    public void revokeAllForUser(Long userId) {
        repository.revokeAllByUserId(userId);
    }

    @Transactional
    public void deleteAllForUser(Long userId) {
        repository.deleteByUserId(userId);
    }

    private static String hash(String value) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(
                    digest.digest(value.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 indisponible", e);
        }
    }
}
