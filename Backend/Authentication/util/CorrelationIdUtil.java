package org.mm.FinanceTracker.Authentication.util;

import org.springframework.stereotype.Component;

@Component
public class CorrelationIdUtil {
    private static final ThreadLocal<String> correlationIdHolder = new ThreadLocal<>();

    public static void setCorrelationId(String correlationId) {
        correlationIdHolder.set(correlationId);
    }

    public static String getCorrelationId() {
        return correlationIdHolder.get();
    }

    public static void clear() {
        correlationIdHolder.remove();
    }
}
