package org.mm.FinanceTracker.Authentication.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class TestAuthController {
    
    @GetMapping("/api/test/auth")
    public String testAuth() {
        return "Authentication system is working!";
    }
}