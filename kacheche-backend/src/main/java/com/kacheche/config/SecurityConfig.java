package com.kacheche.config;

import com.kacheche.security.Action;
import com.kacheche.security.AppUserDetailsService;
import com.kacheche.security.JwtAuthenticationFilter;
import com.kacheche.security.JwtService;
import com.kacheche.security.Permissions;
import com.kacheche.security.Resource;
import com.kacheche.security.RestAccessDeniedHandler;
import com.kacheche.security.RestAuthenticationEntryPoint;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

/**
 * Sécurité de l'API : authentification JWT sans session + autorisation RBAC.
 * Chaque route exige une PERMISSION (jamais un nom de rôle) : les rôles ne sont
 * que des ensembles de permissions, modifiables en base sans toucher au code.
 */
@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // Utilise automatiquement AppUserDetailsService + PasswordEncoder.
    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            JwtService jwtService,
            AppUserDetailsService userDetailsService,
            RestAuthenticationEntryPoint authenticationEntryPoint,
            RestAccessDeniedHandler accessDeniedHandler) throws Exception {

        JwtAuthenticationFilter jwtFilter =
                new JwtAuthenticationFilter(jwtService, userDetailsService);

        return http
                .cors(Customizer.withDefaults())
                .csrf(AbstractHttpConfigurer::disable)
                .httpBasic(AbstractHttpConfigurer::disable)
                .formLogin(AbstractHttpConfigurer::disable)
                .logout(AbstractHttpConfigurer::disable)

                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                .exceptionHandling(handling -> handling
                        .authenticationEntryPoint(authenticationEntryPoint)
                        .accessDeniedHandler(accessDeniedHandler))

                .authorizeHttpRequests(auth -> {

                    // ---- Routes publiques ----
                    auth.requestMatchers(HttpMethod.OPTIONS, "/**").permitAll();
                    auth.requestMatchers("/error").permitAll();
                    auth.requestMatchers(HttpMethod.POST,
                            "/api/auth/login",
                            "/api/auth/refresh",
                            "/api/auth/logout").permitAll();

                    // ---- Utilisateur connecté (me, change-password) ----
                    auth.requestMatchers("/api/auth/**").authenticated();

                    // ---- Permissions "métier" ----
                    auth.requestMatchers("/api/dashboard/**")
                            .hasAuthority(Permissions.DASHBOARD_READ);

                    auth.requestMatchers("/api/audit/**")
                            .hasAuthority(Permissions.AUDIT_READ);

                    auth.requestMatchers(HttpMethod.PATCH, "/api/expenses/*/approve")
                            .hasAuthority(Permissions.EXPENSE_APPROVE);

                    auth.requestMatchers(HttpMethod.PATCH, "/api/expenses/*/reject")
                            .hasAuthority(Permissions.EXPENSE_REJECT);

                    auth.requestMatchers(HttpMethod.POST, "/api/users/*/reset-password")
                            .hasAuthority(Permissions.USER_RESET_PASSWORD);

                    // ---- Écrans de gestion des utilisateurs : listes déroulantes ----
                    auth.requestMatchers(HttpMethod.GET, "/api/roles/**")
                            .hasAnyAuthority(
                                    Resource.ROLE.permission(Action.READ),
                                    Resource.USER.permission(Action.CREATE),
                                    Resource.USER.permission(Action.UPDATE));

                    auth.requestMatchers(HttpMethod.GET, "/api/permissions/**")
                            .hasAnyAuthority(
                                    Resource.ROLE.permission(Action.READ),
                                    Resource.ROLE.permission(Action.CREATE),
                                    Resource.ROLE.permission(Action.UPDATE));

                    // ---- CRUD générique : une règle par ressource et par action ----
                    for (Resource resource : Resource.values()) {
                        for (Action action : Action.values()) {
                            auth.requestMatchers(action.httpMethod(), resource.apiPattern())
                                    .hasAuthority(resource.permission(action));
                        }
                    }

                    // ---- Refus par défaut ----
                    // Toute route d'API non déclarée ci-dessus est interdite.
                    auth.requestMatchers("/api/**").denyAll();

                    auth.anyRequest().authenticated();
                })

                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration = new CorsConfiguration();

        configuration.setAllowedOriginPatterns(
                List.of(
                        "http://localhost:[*]",
                        "http://127.0.0.1:[*]"
                )
        );

        configuration.setAllowedMethods(
                List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS")
        );

        configuration.setAllowedHeaders(List.of("*"));

        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);

        return source;
    }
}
