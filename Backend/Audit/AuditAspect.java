package org.mm.FinanceTracker.Audit;

import lombok.RequiredArgsConstructor;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.springframework.stereotype.Component;
import org.mm.FinanceTracker.Users.UserService;
import org.mm.FinanceTracker.Users.User;

import java.util.HashMap;
import java.util.Map;

@Aspect
@Component
@RequiredArgsConstructor
public class AuditAspect {
    
    private final AuditService auditService;
    private final UserService userService;
    private ThreadLocal<Map<String, Object>> oldValues = new ThreadLocal<>();
    
    @Before("@annotation(auditable)")
    public void captureOldState(JoinPoint joinPoint, Auditable auditable) {
        Object entity = joinPoint.getArgs()[0];
        if (entity != null) {
            Map<String, Object> state = new HashMap<>();
            state.put("entity", entity);
            state.put("auditable", auditable);
            oldValues.set(state);
        }
    }
    
    @AfterReturning(pointcut = "@annotation(auditable)", returning = "result")
    public void logAuditEvent(JoinPoint joinPoint, Auditable auditable, Object result) {
        try {
            Map<String, Object> oldState = oldValues.get();
            if (oldState != null) {
                String entityType = auditable.entityType();
                Object entityId = extractEntityId(result);
                
                auditService.logEntityChange(
                    entityType,
                    entityId,
                    auditable.operation(),
                    oldState.get("entity"),
                    result,
                    auditable.description()
                );
            }
        } finally {
            oldValues.remove();
        }
    }
    
    private Object extractEntityId(Object entity) {
        return null; 
    }
}
