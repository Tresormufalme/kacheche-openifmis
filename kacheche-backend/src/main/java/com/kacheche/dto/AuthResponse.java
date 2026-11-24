package com.kacheche.dto;

public record AuthResponse(
        String accessToken,
        String refreshToken,
        String tokenType,
        long expiresIn,          // durée de vie du jeton d'accès, en secondes
        CurrentUserResponse user
) {
}
