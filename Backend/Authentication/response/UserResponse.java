package org.mm.FinanceTracker.Authentication.response;

public record UserResponse(
    Long id,
    String username,
    String email
) {}