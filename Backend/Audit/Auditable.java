package org.mm.FinanceTracker.Audit;

import java.lang.annotation.*;

@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface Auditable {
    String entityType();
    LogEntry.Operation operation();
    String description() default "";
}
