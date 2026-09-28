package org.mm.FinanceTracker.Authentication.controller;

import org.mm.FinanceTracker.Authentication.response.UserResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/user")
public class UserInfoController {

    @GetMapping("/me")
    public UserResponse getCurrentUser(Authentication authentication) {
        if (authentication instanceof Jwt) {
            Jwt jwt = (Jwt) authentication;
            String userId = jwt.getSubject();
            String username = jwt.getClaimAsString("username");
            String email = jwt.getClaimAsString("email");
            
            return new UserResponse(
                Long.parseLong(userId),
                username,
                email
            );
        }
        
        throw new IllegalStateException("Unexpected authentication type");
    }
}