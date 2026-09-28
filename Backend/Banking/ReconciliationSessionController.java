package org.mm.FinanceTracker.Banking;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/reconciliation-sessions")
public class ReconciliationSessionController {
    
    @Autowired
    private ReconciliationSessionRepository repository;
    
    @Autowired
    private BankReconciliationService reconciliationService;
    
    @GetMapping("/")
    public ResponseEntity<List<ReconciliationSession>> getAllSessions() {
        List<ReconciliationSession> sessions = repository.findAll();
        return sessions.isEmpty()
            ? ResponseEntity.noContent().build()
            : ResponseEntity.ok(sessions);
    }
    
    @GetMapping("/bank-account/{bankAccountId}")
    public ResponseEntity<List<ReconciliationSession>> getSessionsByBankAccount(
            @PathVariable Integer bankAccountId) {
        List<ReconciliationSession> sessions = repository.findByBankAccountId(bankAccountId);
        return ResponseEntity.ok(sessions);
    }
    
    @GetMapping("/status/{status}")
    public ResponseEntity<List<ReconciliationSession>> getSessionsByStatus(
            @PathVariable String status) {
        List<ReconciliationSession> sessions = repository.findByStatus(status);
        return ResponseEntity.ok(sessions);
    }
    
    @GetMapping("/completed")
    public ResponseEntity<List<ReconciliationSession>> getCompletedSessions() {
        List<ReconciliationSession> sessions = repository.findByCompletedAtIsNotNull();
        return ResponseEntity.ok(sessions);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ReconciliationSession> getSessionById(@PathVariable Integer id) {
        return repository.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping("/start")
    public ResponseEntity<ReconciliationSession> startReconciliation(
            @RequestParam Integer bankAccountId,
            @RequestParam Integer statementId,
            @RequestParam String startedBy) {
        
        ReconciliationSession session = reconciliationService.startReconciliation(
            bankAccountId, statementId, startedBy);
        return ResponseEntity.status(HttpStatus.CREATED).body(session);
    }
    
    @PostMapping("/{id}/complete")
    public ResponseEntity<ReconciliationSession> completeReconciliation(
            @PathVariable Integer id,
            @RequestParam(required = false) String notes) {
        
        ReconciliationSession session = reconciliationService.completeReconciliation(id, notes);
        return ResponseEntity.ok(session);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<ReconciliationSession> updateSession(
            @PathVariable Integer id,
            @RequestBody ReconciliationSession sessionDetails) {
        
        return repository.findById(id)
            .map(existing -> {
                existing.setOpeningBookBalance(sessionDetails.getOpeningBookBalance());
                existing.setClosingBookBalance(sessionDetails.getClosingBookBalance());
                existing.setStatementBalance(sessionDetails.getStatementBalance());
                existing.setReconciledBalance(sessionDetails.getReconciledBalance());
                existing.setOutstandingDeposits(sessionDetails.getOutstandingDeposits());
                existing.setOutstandingWithdrawals(sessionDetails.getOutstandingWithdrawals());
                existing.setStatus(sessionDetails.getStatus());
                existing.setNotes(sessionDetails.getNotes());
                
                if ("COMPLETED".equals(sessionDetails.getStatus()) && existing.getCompletedAt() == null) {
                    existing.setCompletedAt(LocalDateTime.now());
                }
                
                ReconciliationSession updated = repository.save(existing);
                return ResponseEntity.ok(updated);
            })
            .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/{id}/variance")
    public ResponseEntity<Double> calculateVariance(@PathVariable Integer id) {
        return repository.findById(id)
            .map(session -> {
                java.math.BigDecimal variance = reconciliationService.calculateVariance(session);
                return ResponseEntity.ok(variance.doubleValue());
            })
            .orElse(ResponseEntity.notFound().build());
    }
}
