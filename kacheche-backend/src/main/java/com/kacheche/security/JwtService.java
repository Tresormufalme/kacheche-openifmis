package com.kacheche.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.UUID;

/**
 * Émission et vérification des jetons d'accès JWT (signés HMAC).
 * Le jeton ne contient que l'identité : les rôles et permissions sont relus
 * en base à chaque requête, donc toute modification de droits est immédiate.
 */
@Service
public class JwtService {

    private static final String ISSUER = "kacheche";
    private static final String TYPE_CLAIM = "typ";
    private static final String ACCESS_TYPE = "access";

    private final SecretKey key;
    private final long accessTokenSeconds;

    public JwtService(
            @Value("${app.security.jwt.secret}") String secret,
            @Value("${app.security.jwt.access-token-minutes:30}") long accessTokenMinutes) {

        if (secret == null || secret.getBytes(StandardCharsets.UTF_8).length < 32) {
            throw new IllegalStateException(
                    "app.security.jwt.secret doit contenir au moins 32 caractères.");
        }

        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.accessTokenSeconds = accessTokenMinutes * 60;
    }

    public String generateAccessToken(AppUserDetails user) {

        Instant now = Instant.now();

        return Jwts.builder()
                .id(UUID.randomUUID().toString())
                .issuer(ISSUER)
                .subject(user.getUsername())
                .claim(TYPE_CLAIM, ACCESS_TYPE)
                .claim("uid", user.getId())
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plusSeconds(accessTokenSeconds)))
                .signWith(key)
                .compact();
    }

    /**
     * Vérifie signature, expiration, émetteur et type du jeton.
     * Retourne le nom d'utilisateur, ou lève une JwtException.
     */
    public String parseAccessToken(String token) {

        Claims claims = Jwts.parser()
                .verifyWith(key)
                .requireIssuer(ISSUER)
                .build()
                .parseSignedClaims(token)
                .getPayload();

        if (!ACCESS_TYPE.equals(claims.get(TYPE_CLAIM, String.class))) {
            throw new JwtException("Type de jeton invalide.");
        }

        return claims.getSubject();
    }

    public long getAccessTokenSeconds() {
        return accessTokenSeconds;
    }
}
