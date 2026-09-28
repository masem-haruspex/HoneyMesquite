package org.mm.FinanceTracker.Authentication.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@RestController
public class CsrfController {

    @GetMapping("/api/csrf")
    public CsrfTokenDto getCsrfToken(HttpServletRequest request) {
        var csrfToken = (org.springframework.security.web.csrf.CsrfToken) request.getAttribute(org.springframework.security.web.csrf.CsrfToken.class.getName());
        if (csrfToken == null) {
            csrfToken = (org.springframework.security.web.csrf.CsrfToken) request.getAttribute("_csrf");
        }
        
        if (csrfToken != null) {
            return new CsrfTokenDto(csrfToken.getHeaderName(), csrfToken.getParameterName(), csrfToken.getToken());
        }
        
        return null;
    }
    
    public static class CsrfTokenDto {
        private String headerName;
        private String parameterName;
        private String token;
        
        public CsrfTokenDto(String headerName, String parameterName, String token) {
            this.headerName = headerName;
            this.parameterName = parameterName;
            this.token = token;
        }
        
        public String getHeaderName() {
            return headerName;
        }
        
        public String getParameterName() {
            return parameterName;
        }
        
        public String getToken() {
            return token;
        }
    }
}
