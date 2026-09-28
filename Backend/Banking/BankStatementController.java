package org.mm.FinanceTracker.Banking;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/bank-statements")
public class BankStatementController {
    
    @Autowired
    private BankStatementRepository repository;
    
    @Autowired
    private BankAccountRepository bankAccountRepository;
    
    @GetMapping("/")
    public ResponseEntity<List<BankStatement>> getAllStatements() {
        List<BankStatement> statements = repository.findAll();
        return statements.isEmpty()
            ? ResponseEntity.noContent().build()
            : ResponseEntity.ok(statements);
    }
    
    @GetMapping("/bank-account/{bankAccountId}")
    public ResponseEntity<List<BankStatement>> getStatementsByBankAccount(
            @PathVariable Integer bankAccountId) {
        List<BankStatement> statements = repository.findByBankAccountId(bankAccountId);
        return ResponseEntity.ok(statements);
    }
    
    @GetMapping("/status/{status}")
    public ResponseEntity<List<BankStatement>> getStatementsByStatus(
            @PathVariable String status) {
        List<BankStatement> statements = repository.findByStatus(status);
        return ResponseEntity.ok(statements);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<BankStatement> getStatementById(@PathVariable Integer id) {
        return repository.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping("/")
    public ResponseEntity<BankStatement> createStatement(@RequestBody BankStatementDTO statementDTO) {
        BankAccount bankAccount = bankAccountRepository.findById(statementDTO.bankAccountId())
            .orElseThrow(() -> new RuntimeException("Bank account not found"));
        
        BankStatement statement = new BankStatement();
        statement.setBankAccount(bankAccount);
        statement.setStatementDate(statementDTO.statementDate());
        statement.setPeriodStart(statementDTO.periodStart());
        statement.setPeriodEnd(statementDTO.periodEnd());
        statement.setOpeningBalance(statementDTO.openingBalance());
        statement.setClosingBalance(statementDTO.closingBalance());
        statement.setStatementFileUrl(statementDTO.statementFileUrl());
        statement.setImportedBy(statementDTO.importedBy());
        statement.setStatus("PENDING");
        
        BankStatement saved = repository.save(statement);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }
    
    @PutMapping("/{id}/reconcile")
    public ResponseEntity<BankStatement> markAsReconciled(@PathVariable Integer id) {
        return repository.findById(id)
            .map(statement -> {
                statement.setStatus("RECONCILED");
                BankStatement updated = repository.save(statement);
                return ResponseEntity.ok(updated);
            })
            .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/date-range")
    public ResponseEntity<List<BankStatement>> getStatementsByDateRange(
            @RequestParam LocalDate startDate,
            @RequestParam LocalDate endDate) {
        List<BankStatement> statements = repository.findByPeriodStartBetween(startDate, endDate);
        return ResponseEntity.ok(statements);
    }
}
