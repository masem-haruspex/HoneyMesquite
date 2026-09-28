package org.mm.FinanceTracker.Authentication.service;

import org.mm.FinanceTracker.Authentication.request.RegisterRequest;
import org.mm.FinanceTracker.Authentication.request.UpdateUserRequest;
import org.mm.FinanceTracker.Authentication.response.AuthenticationResult;
import org.mm.FinanceTracker.Authentication.response.UserResponse;
import org.mm.FinanceTracker.Authentication.util.CorrelationIdUtil;
import org.mm.FinanceTracker.Users.User;
import org.mm.FinanceTracker.Users.UserRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public AuthenticationResult register(RegisterRequest req) {
        String cid = CorrelationIdUtil.getCorrelationId();
        logger.info("REGISTER cid={} username={} email={}", cid, req.username(), req.email());

        if (userRepository.existsByUsername(req.username())) {
            throw new IllegalArgumentException("Username already exists");
        }
        if (userRepository.existsByEmail(req.email())) {
            throw new IllegalArgumentException("Email already exists");
        }

        User user = new User();
        user.setUsername(req.username());
        user.setEmail(req.email());
        user.setFirstName("User");
        user.setLastName("User");
        user.setPasswordHash(passwordEncoder.encode(req.password()));
        user.setIsActive(true);
        user.setIsLocked(false);
        user.setFailedLoginAttempts(0);
        user = userRepository.save(user);

        return new AuthenticationResult("Register successful",
            new UserResponse(user.getId(), user.getUsername(), user.getEmail()));
    }

    @Transactional
    public UserResponse update(Long userId, UpdateUserRequest updateRequest, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new IllegalArgumentException("User not authenticated");
        }
        Jwt jwt = (Jwt) authentication.getPrincipal();
        if (!userId.toString().equals(jwt.getSubject())) {
            throw new IllegalArgumentException("You can only update your own profile");
        }
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));
        if (updateRequest.username() != null && !updateRequest.username().isBlank()) {
            user.setUsername(updateRequest.username());
        }
        userRepository.save(user);
        return new UserResponse(user.getId(), user.getUsername(), user.getEmail());
    }
}
