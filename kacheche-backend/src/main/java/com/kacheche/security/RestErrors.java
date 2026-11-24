package com.kacheche.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.time.LocalDateTime;

/**
 * Écrit les erreurs de sécurité (401 / 403) au même format JSON que
 * GlobalExceptionHandler, avec un "code" lisible par le frontend.
 */
public final class RestErrors {

    private RestErrors() {
    }

    public static void write(
            HttpServletRequest request,
            HttpServletResponse response,
            int status,
            String error,
            String message,
            String code) throws IOException {

        response.setStatus(status);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        String body = "{"
                + "\"timestamp\":\"" + LocalDateTime.now() + "\","
                + "\"status\":" + status + ","
                + "\"error\":\"" + escape(error) + "\","
                + "\"message\":\"" + escape(message) + "\","
                + "\"path\":\"" + escape(request.getRequestURI()) + "\","
                + "\"code\":\"" + escape(code) + "\""
                + "}";

        response.getWriter().write(body);
    }

    private static String escape(String value) {
        return value == null
                ? ""
                : value.replace("\\", "\\\\")
                        .replace("\"", "\\\"")
                        .replace("\n", " ")
                        .replace("\r", " ");
    }
}
