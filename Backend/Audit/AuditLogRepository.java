package org.mm.FinanceTracker.Audit;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<LogEntry, Long> {
    
    List<LogEntry> findByEntityTypeAndEntityIdOrderByEventTimestampDesc(
        String entityType, String entityId);
    
    List<LogEntry> findByUserIdAndEventTimestampBetweenOrderByEventTimestampDesc(
        String userId, Instant start, Instant end);
    
    List<LogEntry> findByEventTypeAndEventTimestampBetweenOrderByEventTimestampDesc(
        String eventType, Instant start, Instant end);
    
    LogEntry findFirstByOrderByEventTimestampDesc();
    
    @Query("SELECT DISTINCT le.entityType FROM LogEntry le WHERE le.entityType IS NOT NULL")
    List<String> findDistinctEntityTypes();
    
    @Query("SELECT DISTINCT le.eventType FROM LogEntry le WHERE le.eventType IS NOT NULL")
    List<String> findDistinctEventTypes();
    
    @Query(value = """
        SELECT * FROM verify_audit_integrity(:entityType, :entityId)
        """, nativeQuery = true)
    List<Object[]> verifyIntegrity(@Param("entityType") String entityType, 
                                   @Param("entityId") String entityId);
}
