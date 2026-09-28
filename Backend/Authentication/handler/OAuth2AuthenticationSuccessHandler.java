package org.mm.FinanceTracker.Authentication.handler;

import org.mm.FinanceTracker.Authentication.config.AppProperties;
import org.mm.FinanceTracker.Users.User;
import org.mm.FinanceTracker.Users.UserRepository;
import org.mm.FinanceTracker.Users.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Slf4j
@Component
@RequiredArgsConstructor
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final AppProperties appProperties;
    private final UserRepository userRepository;
    private final UserService userService;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException {
        OAuth2User oauthUser = (OAuth2User) authentication.getPrincipal();
        User user = createOrUpdateLocalUser(oauthUser);
        log.info("OAuth2 login successful for {}", user.getUsername());
        getRedirectStrategy().sendRedirect(request, response, "/oauth-success");
    }

    @Override
    protected String determineTargetUrl(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) {
        String redirectUri = request.getParameter("redirect_uri");
        if (redirectUri != null && !redirectUri.isBlank()) return redirectUri;
        return appProperties.getDefaultRedirectUri();
    }

    private User createOrUpdateLocalUser(OAuth2User oauthUser) {
        String name  = (String) oauthUser.getAttributes().get("name");
        String email = (String) oauthUser.getAttributes().get("email");
        if (email == null) throw new IllegalStateException("Email not found from OAuth2 provider");

        return userRepository.findByEmail(email)
            .map(existing -> {
                if (name != null && !name.equals(existing.getUsername())) {
                    existing.setUsername(name);
                    return userRepository.save(existing);
                }
                return existing;
            })
            .orElseGet(() -> {
                String base = name != null ? name : email.split("@")[0];
                String unique = base;
                int i = 1;
                while (userRepository.existsByUsername(unique)) unique = base + i++;
                return userService.createAuthUser(unique, email,
                    java.util.UUID.randomUUID().toString());
            });
    }
}
