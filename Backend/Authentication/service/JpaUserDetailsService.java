package org.mm.FinanceTracker.Authentication.service;

import org.mm.FinanceTracker.Users.User;
import org.mm.FinanceTracker.Users.UserRepository;
import org.mm.FinanceTracker.Authentication.repository.AdminUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class JpaUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;
    private final AdminUserRepository adminUserRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));

        List<SimpleGrantedAuthority> authorities = new ArrayList<>();
        authorities.add(new SimpleGrantedAuthority("ROLE_USER"));
        if (adminUserRepository.isUserAdmin(user.getId())) {
            authorities.add(new SimpleGrantedAuthority("ROLE_ADMIN"));
        }

        return org.springframework.security.core.userdetails.User.builder()
            .username(user.getUsername())
            .password(user.getPasswordHash() == null ? "" : user.getPasswordHash())
            .authorities(authorities)
            .accountExpired(false)
            .accountLocked(Boolean.TRUE.equals(user.getIsLocked()))
            .credentialsExpired(false)
            .disabled(!Boolean.TRUE.equals(user.getIsActive()))
            .build();
    }
}
