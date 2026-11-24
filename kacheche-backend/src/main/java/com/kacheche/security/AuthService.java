package com.kacheche.security;

import com.kacheche.dto.AuthResponse;
import com.kacheche.dto.ChangePasswordRequest;
import com.kacheche.dto.CurrentUserResponse;
import com.kacheche.dto.LoginRequest;
import com.kacheche.entity.User;
import com.kacheche.exception.ResourceNotFoundException;
import com.kacheche.repository.UserRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;

@Service
public class AuthService {

    private static final String TOKEN_TYPE = "Bearer";

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;
    private final LoginAttemptService loginAttemptService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(
            AuthenticationManager authenticationManager,
            JwtService jwtService,
            RefreshTokenService refreshTokenService,
            LoginAttemptService loginAttemptService,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {

        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.refreshTokenService = refreshTokenService;
        this.loginAttemptService = loginAttemptService;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // ---------- CONNEXION ----------
    public AuthResponse login(LoginRequest request) {

        String username = request.username().trim().toLowerCase(Locale.ROOT);

        Authentication authentication;

        try {
            // Vérifie le mot de passe, l'état activé et le verrouillage du compte.
            authentication = authenticationManager.authenticate(
                    UsernamePasswordAuthenticationToken.unauthenticated(
                            username, request.password()));

        } catch (BadCredentialsException e) {
            loginAttemptService.recordFailure(username);
            throw e;
        }

        AppUserDetails user = (AppUserDetails) authentication.getPrincipal();

        loginAttemptService.recordSuccess(user.getId());

        return buildResponse(user, refreshTokenService.issue(user.getId()));
    }

    // ---------- RAFRAÎCHISSEMENT (rotation du jeton) ----------
    @Transactional(noRollbackFor = BadCredentialsException.class)
    public AuthResponse refresh(String rawRefreshToken) {

        RefreshTokenService.Rotation rotation = refreshTokenService.rotate(rawRefreshToken);

        return buildResponse(
                AppUserDetails.from(rotation.user()),
                rotation.refreshToken());
    }

    // ---------- DÉCONNEXION ----------
    public void logout(String rawRefreshToken) {
        if (rawRefreshToken != null && !rawRefreshToken.isBlank()) {
            refreshTokenService.revoke(rawRefreshToken);
        }
    }

    // ---------- CHANGEMENT DE MOT DE PASSE ----------
    @Transactional
    public AuthResponse changePassword(Long userId, ChangePasswordRequest request) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable."));

        if (!passwordEncoder.matches(request.currentPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Le mot de passe actuel est incorrect.");
        }

        if (passwordEncoder.matches(request.newPassword(), user.getPassword())) {
            throw new IllegalArgumentException(
                    "Le nouveau mot de passe doit être différent de l’ancien.");
        }

        user.setPassword(passwordEncoder.encode(request.newPassword()));
        user.setMustChangePassword(false);
        userRepository.saveAndFlush(user);

        // Toutes les anciennes sessions sont coupées ; on en ouvre une nouvelle.
        refreshTokenService.revokeAllForUser(userId);

        return buildResponse(
                AppUserDetails.from(user),
                refreshTokenService.issue(userId));
    }

    private AuthResponse buildResponse(AppUserDetails user, String refreshToken) {
        return new AuthResponse(
                jwtService.generateAccessToken(user),
                refreshToken,
                TOKEN_TYPE,
                jwtService.getAccessTokenSeconds(),
                CurrentUserResponse.from(user)
        );
    }
}
