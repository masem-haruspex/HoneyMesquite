package org.mm.FinanceTracker.Accounting;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/equity-transactions")
public class EquityTransactionController {

    @Autowired
    private EquityTransactionRepository repository;

    @Autowired
    private JournalEntryRepository journalEntryRepository;

    @GetMapping("/")
    public ResponseEntity<List<EquityTransaction>> getAllTransactions() {
        List<EquityTransaction> transactions = repository.findAll();
        return transactions.isEmpty()
            ? ResponseEntity.noContent().build()
            : ResponseEntity.ok(transactions);
    }

    @GetMapping("/type/{type}")
    public ResponseEntity<List<EquityTransaction>> getTransactionsByType(@PathVariable String type) {
        List<EquityTransaction> transactions = repository.findAll().stream()
            .filter(tx -> type.equalsIgnoreCase(tx.getType()))
            .toList();
        return ResponseEntity.ok(transactions);
    }

    @GetMapping("/{id}")
    public ResponseEntity<EquityTransaction> getTransactionById(@PathVariable Long id) {
        return repository.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/")
    public ResponseEntity<EquityTransaction> createTransaction(@RequestBody EquityTransactionRequest request) {
        EquityTransaction transaction = new EquityTransaction();
        transaction.setType(request.type().toUpperCase());
        transaction.setDescription(request.description());
        transaction.setAmount(request.amount());
        transaction.setTransactionDate(request.transactionDate());
        transaction.setEquityAccountCode(request.equityAccountCode());
        
        JournalEntry journalEntry = createEquityJournalEntry(transaction);
        journalEntry = journalEntryRepository.save(journalEntry);
        transaction.setJournalEntryId(journalEntry.getId());
        
        EquityTransaction saved = repository.save(transaction);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @GetMapping("/capital-contributions")
    public ResponseEntity<List<EquityTransaction>> getCapitalContributions() {
        List<EquityTransaction> transactions = repository.findAll().stream()
            .filter(tx -> "CAPITAL_CONTRIBUTION".equalsIgnoreCase(tx.getType()))
            .toList();
        return ResponseEntity.ok(transactions);
    }

    @GetMapping("/owner-draws")
    public ResponseEntity<List<EquityTransaction>> getOwnerDraws() {
        List<EquityTransaction> transactions = repository.findAll().stream()
            .filter(tx -> "OWNER_DRAW".equalsIgnoreCase(tx.getType()))
            .toList();
        return ResponseEntity.ok(transactions);
    }

    @GetMapping("/summary/{year}")
    public ResponseEntity<EquitySummary> getEquitySummary(@PathVariable Integer year) {
        List<EquityTransaction> allTransactions = repository.findAll();
        
        BigDecimal totalContributions = allTransactions.stream()
            .filter(tx -> "CAPITAL_CONTRIBUTION".equalsIgnoreCase(tx.getType()) &&
                         tx.getTransactionDate().getYear() == year)
            .map(EquityTransaction::getAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        BigDecimal totalDraws = allTransactions.stream()
            .filter(tx -> "OWNER_DRAW".equalsIgnoreCase(tx.getType()) &&
                         tx.getTransactionDate().getYear() == year)
            .map(EquityTransaction::getAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        BigDecimal totalRetainedEarningsAdjustments = allTransactions.stream()
            .filter(tx -> "RETAINED_EARNINGS_ADJUSTMENT".equalsIgnoreCase(tx.getType()) &&
                         tx.getTransactionDate().getYear() == year)
            .map(EquityTransaction::getAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        EquitySummary summary = new EquitySummary(
            year,
            totalContributions,
            totalDraws,
            totalRetainedEarningsAdjustments,
            totalContributions.subtract(totalDraws).add(totalRetainedEarningsAdjustments)
        );
        
        return ResponseEntity.ok(summary);
    }

    @PutMapping("/{id}")
    public ResponseEntity<EquityTransaction> updateTransaction(@PathVariable Long id, @RequestBody EquityTransactionRequest request) {
        return repository.findById(id)
            .map(transaction -> {
                transaction.setType(request.type().toUpperCase());
                transaction.setDescription(request.description());
                transaction.setAmount(request.amount());
                transaction.setTransactionDate(request.transactionDate());
                transaction.setEquityAccountCode(request.equityAccountCode());
                
                EquityTransaction updated = repository.save(transaction);
                return ResponseEntity.ok(updated);
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTransaction(@PathVariable Long id) {
        if (repository.existsById(id)) {
            repository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    private JournalEntry createEquityJournalEntry(EquityTransaction transaction) {
        JournalEntry entry = new JournalEntry();
        entry.setDescription("Equity: " + transaction.getDescription());
        entry.setDate(java.time.LocalDateTime.now());
        
        switch (transaction.getType().toUpperCase()) {
            case "CAPITAL_CONTRIBUTION":
                entry.setDebitAmount(transaction.getAmount()); 
                entry.setCreditAmount(transaction.getAmount());
                entry.setAccountCode(transaction.getEquityAccountCode());
                break;
                
            case "OWNER_DRAW":
                entry.setDebitAmount(transaction.getAmount());
                entry.setCreditAmount(transaction.getAmount()); 
                entry.setAccountCode(transaction.getEquityAccountCode());
                break;
                
            case "RETAINED_EARNINGS_ADJUSTMENT":
                if (transaction.getAmount().compareTo(BigDecimal.ZERO) > 0) {
                    entry.setCreditAmount(transaction.getAmount());
                } else {
                    entry.setDebitAmount(transaction.getAmount().abs());
                }
                entry.setAccountCode(transaction.getEquityAccountCode());
                break;
        }
        
        entry.setAmount(transaction.getAmount());
        entry.setType("EQUITY");
        entry.setReferenceNumber("EQ-" + transaction.getId());
        entry.setEquityTransactionId(transaction.getId());
        
        return entry;
    }

    public record EquityTransactionRequest(
        String type, 
        String description,
        BigDecimal amount,
        LocalDate transactionDate,
        String equityAccountCode
    ) {}

    public record EquitySummary(
        Integer year,
        BigDecimal totalCapitalContributions,
        BigDecimal totalOwnerDraws,
        BigDecimal totalRetainedEarningsAdjustments,
        BigDecimal netEquityChange
    ) {}
}
