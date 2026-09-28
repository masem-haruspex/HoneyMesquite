package org.mm.FinanceTracker.Audit;

import lombok.RequiredArgsConstructor;
import org.mm.FinanceTracker.Audit.dto.AuditLogDTO;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;

@RestController
@RequestMapping("/api/audit")
@RequiredArgsConstructor
public class AuditController {
    
    private final AuditService auditService;
    
    @GetMapping("/logs/entity/{entityType}/{entityId}")
    public ResponseEntity<List<AuditLogDTO>> getAuditLogsForEntity(
            @PathVariable String entityType,
            @PathVariable String entityId) {
        List<AuditLogDTO> logs = auditService.getAuditLogsForEntity(entityType, entityId);
        return ResponseEntity.ok(logs);
    }
    
    @GetMapping("/logs/user/{userId}")
    public ResponseEntity<List<AuditLogDTO>> getAuditLogsForUser(
            @PathVariable String userId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        Instant start = startDate.atStartOfDay(ZoneId.systemDefault()).toInstant();
        Instant end = endDate.atStartOfDay(ZoneId.systemDefault()).plusDays(1).minusSeconds(1).toInstant();
        
        List<AuditLogDTO> logs = auditService.getAuditLogsForUser(userId, start, end);
        return ResponseEntity.ok(logs);
    }
    
    @GetMapping("/logs/event/{eventType}")
    public ResponseEntity<List<AuditLogDTO>> getAuditLogsForEventType(
            @PathVariable String eventType,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        Instant start = startDate.atStartOfDay(ZoneId.systemDefault()).toInstant();
        Instant end = endDate.atStartOfDay(ZoneId.systemDefault()).plusDays(1).minusSeconds(1).toInstant();
        
        List<AuditLogDTO> logs = auditService.getAuditLogsForEventType(eventType, start, end);
        return ResponseEntity.ok(logs);
    }
    
    @GetMapping("/entity-types")
    public ResponseEntity<List<String>> getEntityTypes() {
		List<String> entityTypes = auditService.findDistinctEntityTypes();
        return ResponseEntity.ok(entityTypes);
    }
    
    @GetMapping("/event-types")
    public ResponseEntity<List<String>> getEventTypes() {
		List<String> eventTypes = auditService.findDistinctEventTypes();
        return ResponseEntity.ok(eventTypes);
    }
    
    @GetMapping("/verify/{entityType}/{entityId}")
    public ResponseEntity<Boolean> verifyAuditTrail(
            @PathVariable String entityType,
            @PathVariable String entityId) {
        boolean isValid = auditService.verifyAuditTrail(entityType, entityId);
        return ResponseEntity.ok(isValid);
    }
}
