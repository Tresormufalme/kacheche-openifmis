package com.kacheche.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;

/**
 * 401 : aucun jeton, jeton invalide ou jeton expiré.
 */
@Component
public class RestAuthenticationEntryPoint implements AuthenticationEntryPoint {

    @Override
    public void commence(
            HttpServletRequest request,
            HttpServletResponse response,
            AuthenticationException authException) throws IOException {

        Object reason = request.getAttribute(JwtAuthenticationFilter.ERROR_ATTRIBUTE);

        if ("TOKEN_EXPIRED".equals(reason)) {
            RestErrors.write(request, response, 401, "Unauthorized",
                    "Votre session a expiré. Veuillez vous reconnecter.", "TOKEN_EXPIRED");
            return;
        }

        if ("TOKEN_INVALID".equals(reason)) {
            RestErrors.write(request, response, 401, "Unauthorized",
                    "Jeton d’authentification invalide.", "TOKEN_INVALID");
            return;
        }

        RestErrors.write(request, response, 401, "Unauthorized",
                "Authentification requise.", "UNAUTHENTICATED");
    }
}
