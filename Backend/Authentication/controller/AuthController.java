package org.mm.FinanceTracker.Authentication.controller;

import org.mm.FinanceTracker.Authentication.request.RegisterRequest;
import org.mm.FinanceTracker.Authentication.request.UpdateUserRequest;
import org.mm.FinanceTracker.Authentication.response.AuthenticationResult;
import org.mm.FinanceTracker.Authentication.response.UserResponse;
import org.mm.FinanceTracker.Authentication.service.AuthService;
import org.mm.FinanceTracker.Authentication.util.CorrelationIdUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "APIs for user authentication and registration")
public class AuthController {
    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);
    private static final long SLOW_OPERATION_THRESHOLD_MS = 2000;
    private final AuthService authService;

    @PostMapping("/register")
    @Operation(summary = "Register new user", description = "Create user account with username, email, password")
    @ApiResponse(responseCode = "201", description = "User registered successfully")
    @ApiResponse(responseCode = "400", description = "Invalid input data")
    @ApiResponse(responseCode = "409", description = "Username already exists")
    public ResponseEntity<AuthenticationResult> register(@Valid @RequestBody RegisterRequest req) {
        long startTime = System.currentTimeMillis();
        String correlationId = CorrelationIdUtil.getCorrelationId();
        logger.info("REGISTER request - correlationId: {}, username: {}, email: {}", correlationId, req.username(), req.email());

        try {
            AuthenticationResult result = authService.register(req);
            logger.info("REGISTER success - correlationId: {}, username: {}, userId: {}", correlationId, req.username(), result.user().id());
            return ResponseEntity.status(HttpStatus.CREATED).body(result);
        } finally {
            long duration = System.currentTimeMillis() - startTime;
            logger.info("REGISTER API call completed in {}ms - correlationId: {}", duration, correlationId);
            if (duration > SLOW_OPERATION_THRESHOLD_MS)
                logger.warn("SLOW API: REGISTER took {}ms - correlationId: {}", duration, correlationId);
        }
    }

    @PutMapping("/{userId}")
    @Operation(summary = "Update user profile", description = "Update username")
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponse(responseCode = "200", description = "User updated successfully")
    @ApiResponse(responseCode = "403", description = "Can only update own profile")
    public ResponseEntity<UserResponse> updateUser(@PathVariable Long userId, @Valid @RequestBody UpdateUserRequest updateRequest, Authentication authentication) {
        long startTime = System.currentTimeMillis();
        String correlationId = CorrelationIdUtil.getCorrelationId();
        logger.info("UPDATE_USER request - correlationId: {}, userId: {}, newUsername: {},", correlationId, userId, updateRequest.username());

        try {
            UserResponse userResponse = authService.update(userId, updateRequest, authentication);
            logger.info("UPDATE_USER success - correlationId: {}, userId: {}, username: {}", correlationId, userId, userResponse.username());
            return ResponseEntity.ok(userResponse);
        } finally {
            long duration = System.currentTimeMillis() - startTime;
            logger.info("UPDATE_USER API call completed in {}ms - correlationId: {}", duration, correlationId);
            if (duration > SLOW_OPERATION_THRESHOLD_MS)
                logger.warn("SLOW API: UPDATE_USER took {}ms - correlationId: {}", duration, correlationId);
        }
    }
}
