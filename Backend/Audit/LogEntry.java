package org.mm.FinanceTracker.Audit;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.Map;

@Entity
@Table(name = "audit_logs")
@Data
public class LogEntry {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @CreationTimestamp
    @Column(name = "event_timestamp", nullable = false, updatable = false)
    private Instant eventTimestamp;
    
    @Column(name = "user_id", length = 100)
    private String userId;
    
    @Column(name = "user_ip")
    private String userIp;
    
    @Column(name = "user_agent", length = 500)
    private String userAgent;
    
    @Column(name = "event_type", nullable = false, length = 50)
    private String eventType; // e.g., "JOURNAL_ENTRY", "BUDGET_UPDATE"
    
    @Column(name = "entity_type", nullable = false, length = 50)
    private String entityType; // e.g., "JournalEntry", "BudgetAllocation"
    
    @Column(name = "entity_id", length = 100)
    private String entityId;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Operation operation;
    
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "old_values", columnDefinition = "jsonb")
    private Map<String, Object> oldValues;
    
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "new_values", columnDefinition = "jsonb")
    private Map<String, Object> newValues;
    
    @Column(name = "source_module", length = 50)
    private String sourceModule;
    
    @Column(length = 1000)
    private String description;
    
    @Column(name = "http_method", length = 10)
    private String httpMethod;
    
    @Column(length = 255)
    private String endpoint;
    
    @Column(nullable = false, length = 64)
    private String hash;
    
    @Column(name = "previous_hash", length = 64)
    private String previousHash;
    
    @Version
    private Integer version;
    
    public enum Operation {
        CREATE, UPDATE, DELETE, VIEW, EXECUTE, APPROVE, REJECT
    }
}
