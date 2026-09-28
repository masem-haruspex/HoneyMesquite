package org.mm.FinanceTracker.Authentication.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class OAuthSuccessController {

    @GetMapping("/oauth-success")
    public String oauthSuccess() {
        return "oauth-success";
    }
}