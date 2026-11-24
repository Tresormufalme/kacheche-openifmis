package com.kacheche.security;

import com.kacheche.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;

/**
 * Protection contre la force brute : verrouillage temporaire du compte
 * après trop d'échecs consécutifs.
 * REQUIRES_NEW : le compteur est enregistré même si la connexion échoue.
 */
@Service
public class LoginAttemptService {

    private final UserRepository userRepository;
    private final int maxFailedAttempts;
    private final Duration lockDuration;

    public LoginAttemptService(
            UserRepository userRepository,
            @Value("${app.security.max-failed-attempts:5}") int maxFailedAttempts,
            @Value("${app.security.lock-minutes:15}") long lockMinutes) {

        this.userRepository = userRepository;
        this.maxFailedAttempts = maxFailedAttempts;
        this.lockDuration = Duration.ofMinutes(lockMinutes);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void recordFailure(String username) {

        userRepository.findByUsernameIgnoreCase(username).ifPresent(user -> {

            userRepository.incrementFailedAttempts(user.getId());

            if (user.getFailedAttempts() + 1 >= maxFailedAttempts) {
                userRepository.lock(user.getId(), Instant.now().plus(lockDuration));
            }
        });
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void recordSuccess(Long userId) {
        userRepository.registerSuccessfulLogin(userId, Instant.now());
    }
}
