package com.kacheche.security;

import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Set;

/**
 * Authentifie chaque requête à partir de l'en-tête "Authorization: Bearer <jeton>".
 * Les droits sont relus en base : un compte désactivé, verrouillé ou dont les
 * rôles ont changé est pris en compte immédiatement.
 *
 * Volontairement NON déclaré comme @Component (sinon Spring Boot l'enregistrerait
 * une deuxième fois comme filtre servlet) : il est créé par SecurityConfig.
 */
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    public static final String ERROR_ATTRIBUTE = "kacheche.auth.error";

    private static final String BEARER_PREFIX = "Bearer ";

    // Seules routes autorisées tant que le mot de passe provisoire n'est pas changé
    private static final Set<String> PASSWORD_CHANGE_ALLOWED = Set.of(
            "/api/auth/me",
            "/api/auth/change-password",
            "/api/auth/logout"
    );

    private final JwtService jwtService;
    private final AppUserDetailsService userDetailsService;

    public JwtAuthenticationFilter(
            JwtService jwtService,
            AppUserDetailsService userDetailsService) {

        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {

        String header = request.getHeader(HttpHeaders.AUTHORIZATION);

        if (header != null && header.startsWith(BEARER_PREFIX)) {

            try {
                String username = jwtService.parseAccessToken(
                        header.substring(BEARER_PREFIX.length()).trim());

                AppUserDetails user =
                        (AppUserDetails) userDetailsService.loadUserByUsername(username);

                if (user.isEnabled() && user.isAccountNonLocked()) {

                    if (user.isMustChangePassword()
                            && !PASSWORD_CHANGE_ALLOWED.contains(request.getRequestURI())) {

                        RestErrors.write(request, response, 403, "Forbidden",
                                "Vous devez changer votre mot de passe avant de continuer.",
                                "PASSWORD_CHANGE_REQUIRED");
                        return;
                    }

                    UsernamePasswordAuthenticationToken authentication =
                            UsernamePasswordAuthenticationToken.authenticated(
                                    user, null, user.getAuthorities());

                    SecurityContextHolder.getContext().setAuthentication(authentication);

                } else {
                    request.setAttribute(ERROR_ATTRIBUTE, "TOKEN_INVALID");
                }

            } catch (ExpiredJwtException e) {
                request.setAttribute(ERROR_ATTRIBUTE, "TOKEN_EXPIRED");

            } catch (JwtException | IllegalArgumentException | UsernameNotFoundException e) {
                request.setAttribute(ERROR_ATTRIBUTE, "TOKEN_INVALID");
            }
        }

        filterChain.doFilter(request, response);
    }
}
