
package com.kacheche.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.beans.factory.annotation.Value;

import java.util.List;

@Configuration
public class SecurityConfig {

    // 1. Encoder les mots de passe
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // 2. Déclarer les utilisateurs de démonstration

    @Bean
    public UserDetailsService userDetailsService(
            PasswordEncoder passwordEncoder,
            @Value("${app.security.admin-password}") String adminPassword,
            @Value("${app.security.comptable-password}") String comptablePassword) {

        UserDetails admin = User.builder()
                .username("admin")
                .password(passwordEncoder.encode(adminPassword))
                .roles("ADMIN")
                .build();

        UserDetails comptable = User.builder()
                .username("comptable")
                .password(passwordEncoder.encode(comptablePassword))
                .roles("COMPTABLE")
                .build();

        return new InMemoryUserDetailsManager(admin, comptable);
    }

    // 3. Définir les règles de sécurité HTTP
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http)
            throws Exception {

        return http
                .cors(Customizer.withDefaults())
                .csrf(csrf -> csrf.disable())

                .authorizeHttpRequests(auth -> auth

                        // Autoriser les requêtes OPTIONS pour Angular
                        .requestMatchers(HttpMethod.OPTIONS, "/**")
                        .permitAll()

                        // AUDIT : ADMIN uniquement
                        .requestMatchers("/api/audit/**")
                        .hasRole("ADMIN")

                        // EXPENSES : consultation pour ADMIN et COMPTABLE
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/expenses/**"
                        )
                        .hasAnyRole("ADMIN", "COMPTABLE")

                        // EXPENSES : création pour ADMIN et COMPTABLE
                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/expenses/**"
                        )
                        .hasAnyRole("ADMIN", "COMPTABLE")

                        // EXPENSES : modification pour ADMIN et COMPTABLE
                        .requestMatchers(
                                HttpMethod.PUT,
                                "/api/expenses/**"
                        )
                        .hasAnyRole("ADMIN", "COMPTABLE")

                        // EXPENSES : approbation réservée à ADMIN
                        .requestMatchers(
                                HttpMethod.PATCH,
                                "/api/expenses/*/approve"
                        )
                        .hasRole("ADMIN")

                        // EXPENSES : rejet réservé à ADMIN
                        .requestMatchers(
                                HttpMethod.PATCH,
                                "/api/expenses/*/reject"
                        )
                        .hasRole("ADMIN")

                        // EXPENSES : suppression réservée à ADMIN
                        .requestMatchers(
                                HttpMethod.DELETE,
                                "/api/expenses/**"
                        )
                        .hasRole("ADMIN")

                        // CONSULTATION : départements, budgets et dashboard
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/departments/**",
                                "/api/budgets/**",
                                "/api/dashboard/**"
                        )
                        .hasAnyRole("ADMIN", "COMPTABLE")

                        // MODIFICATION : départements et budgets
                        // ADMIN uniquement
                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/departments/**",
                                "/api/budgets/**"
                        )
                        .hasRole("ADMIN")

                        .requestMatchers(
                                HttpMethod.PUT,
                                "/api/departments/**",
                                "/api/budgets/**"
                        )
                        .hasRole("ADMIN")

                        .requestMatchers(
                                HttpMethod.DELETE,
                                "/api/departments/**",
                                "/api/budgets/**"
                        )
                        .hasRole("ADMIN")

                        // Toutes les autres API nécessitent une authentification
                        .requestMatchers("/api/**")
                        .authenticated()

                        // Les autres routes restent accessibles
                        .anyRequest()
                        .permitAll()
                )

                .httpBasic(Customizer.withDefaults())
                .build();
    }

    // 4. Configuration CORS
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration = new CorsConfiguration();

        // Origines autorisées pour Angular
        configuration.setAllowedOriginPatterns(
                List.of(
                        "http://localhost:[*]",
                        "http://127.0.0.1:[*]"
                )
        );

        // Méthodes HTTP autorisées
        configuration.setAllowedMethods(
                List.of(
                        "GET",
                        "POST",
                        "PUT",
                        "DELETE",
                        "PATCH",
                        "OPTIONS"
                )
        );

        // En-têtes autorisés
        configuration.setAllowedHeaders(List.of("*"));

        // Autoriser les credentials
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration("/**", configuration);

        return source;
    }
}
