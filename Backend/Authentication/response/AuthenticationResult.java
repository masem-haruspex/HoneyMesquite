package org.mm.FinanceTracker.Authentication.response;

import org.mm.FinanceTracker.Authentication.response.UserResponse;

public record AuthenticationResult(
    String message,
    UserResponse user
) {}