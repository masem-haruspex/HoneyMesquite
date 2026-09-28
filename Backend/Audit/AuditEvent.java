package org.mm.FinanceTracker.Audit;

import lombok.Builder;
import lombok.Data;

import java.util.Map;

@Data
@Builder
public class AuditEvent {
    private String eventType;          
    private String entityType;         
    private String entityId;           
    private LogEntry.Operation operation;  
    private Map<String, Object> oldValues;
    private Map<String, Object> newValues;
    private String sourceModule;       
    private String description;
}
