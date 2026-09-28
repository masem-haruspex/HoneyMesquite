package org.mm.FinanceTracker.Banking;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/bank-statement-lines")
public class BankStatementLineController {
    
    @Autowired
    private BankStatementLineRepository repository;
    
    @Autowired
    private BankStatementRepository statementRepository;
    
    @GetMapping("/")
    public ResponseEntity<List<BankStatementLine>> getAllLines() {
        List<BankStatementLine> lines = repository.findAll();
        return lines.isEmpty()
            ? ResponseEntity.noContent().build()
            : ResponseEntity.ok(lines);
    }
    
    @GetMapping("/statement/{statementId}")
    public ResponseEntity<List<BankStatementLine>> getLinesByStatement(
            @PathVariable Integer statementId) {
        List<BankStatementLine> lines = repository.findByStatementId(statementId);
        return ResponseEntity.ok(lines);
    }
    
    @GetMapping("/unreconciled")
    public ResponseEntity<List<BankStatementLine>> getUnreconciledLines() {
        List<BankStatementLine> lines = repository.findByIsReconciledFalse();
        return ResponseEntity.ok(lines);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<BankStatementLine> getLineById(@PathVariable Integer id) {
        return repository.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping("/")
    public ResponseEntity<BankStatementLine> createLine(@RequestBody BankStatementLine line) {
        if (line.getStatement() != null && line.getStatement().getId() != null) {
            statementRepository.findById(line.getStatement().getId())
                .orElseThrow(() -> new RuntimeException("Bank statement not found"));
        }
        
        BankStatementLine saved = repository.save(line);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }
    
    @PutMapping("/{id}/reconcile")
    public ResponseEntity<BankStatementLine> reconcileLine(
            @PathVariable Integer id,
            @RequestParam Long journalEntryId) {
        
        return repository.findById(id)
            .map(line -> {
                line.setIsReconciled(true);
                line.setJournalEntryId(journalEntryId);
                BankStatementLine updated = repository.save(line);
                return ResponseEntity.ok(updated);
            })
            .orElse(ResponseEntity.notFound().build());
    }
    
    @PutMapping("/batch-reconcile")
    public ResponseEntity<Void> batchReconcileLines(@RequestBody List<Integer> lineIds) {
        List<BankStatementLine> lines = repository.findAllById(lineIds);
        lines.forEach(line -> line.setIsReconciled(true));
        repository.saveAll(lines);
        return ResponseEntity.ok().build();
    }
}
