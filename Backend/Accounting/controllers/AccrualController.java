package org.mm.FinanceTracker.Accounting;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/accruals")
public class AccrualController {

    @Autowired
    private AccrualRepository repository;

    @Autowired
    private JournalEntryRepository journalEntryRepository;

    @GetMapping("/")
    public ResponseEntity<List<Accrual>> getAllAccruals() {
        List<Accrual> accruals = repository.findAll();
        return accruals.isEmpty()
            ? ResponseEntity.noContent().build()
            : ResponseEntity.ok(accruals);
    }

    @GetMapping("/active")
    public ResponseEntity<List<Accrual>> getActiveAccruals() {
        List<Accrual> accruals = repository.findAll().stream()
            .filter(accrual -> !Boolean.TRUE.equals(accrual.getIsReversed()))
            .toList();
        return ResponseEntity.ok(accruals);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Accrual> getAccrualById(@PathVariable Long id) {
        return repository.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/type/{type}")
    public ResponseEntity<List<Accrual>> getAccrualsByType(@PathVariable String type) {
        List<Accrual> accruals = repository.findAll().stream()
            .filter(accrual -> type.equalsIgnoreCase(accrual.getType()))
            .toList();
        return ResponseEntity.ok(accruals);
    }

    @PostMapping("/")
    public ResponseEntity<Accrual> createAccrual(@RequestBody AccrualRequest request) {
        Accrual accrual = new Accrual();
        accrual.setType(request.type().toUpperCase());
        accrual.setDescription(request.description());
        accrual.setAmount(request.amount());
        accrual.setAccrualDate(request.accrualDate());
        accrual.setReversalDate(request.reversalDate());
        accrual.setLiabilityOrAssetAccountCode(request.liabilityOrAssetAccountCode());
        accrual.setExpenseOrRevenueAccountCode(request.expenseOrRevenueAccountCode());
        
        JournalEntry journalEntry = createAccrualJournalEntry(accrual);
        journalEntry = journalEntryRepository.save(journalEntry);
        accrual.setJournalEntryId(journalEntry.getId());
        
        Accrual saved = repository.save(accrual);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PostMapping("/{id}/reverse")
    public ResponseEntity<Accrual> reverseAccrual(@PathVariable Long id) {
        return repository.findById(id)
            .map(accrual -> {
                if (Boolean.TRUE.equals(accrual.getIsReversed())) {
                    throw new RuntimeException("Accrual already reversed");
                }
                
                JournalEntry reversalEntry = createReversalJournalEntry(accrual);
                reversalEntry = journalEntryRepository.save(reversalEntry);
                
                accrual.setIsReversed(true);
                accrual.setReversalDate(LocalDate.now());
                
                Accrual updated = repository.save(accrual);
                return ResponseEntity.ok(updated);
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/unreversed")
    public ResponseEntity<List<Accrual>> getUnreversedAccruals() {
        List<Accrual> accruals = repository.findAll().stream()
            .filter(accrual -> !Boolean.TRUE.equals(accrual.getIsReversed()))
            .filter(accrual -> accrual.getReversalDate() != null && 
                              accrual.getReversalDate().isBefore(LocalDate.now()))
            .toList();
        return ResponseEntity.ok(accruals);
    }

    @GetMapping("/pending-reversal")
    public ResponseEntity<List<Accrual>> getPendingReversalAccruals() {
        List<Accrual> accruals = repository.findAll().stream()
            .filter(accrual -> !Boolean.TRUE.equals(accrual.getIsReversed()))
            .filter(accrual -> accrual.getReversalDate() != null && 
                              accrual.getReversalDate().isBefore(LocalDate.now().plusDays(7)))
            .toList();
        return ResponseEntity.ok(accruals);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Accrual> updateAccrual(@PathVariable Long id, @RequestBody AccrualRequest request) {
        return repository.findById(id)
            .map(accrual -> {
                accrual.setType(request.type().toUpperCase());
                accrual.setDescription(request.description());
                accrual.setAmount(request.amount());
                accrual.setAccrualDate(request.accrualDate());
                accrual.setReversalDate(request.reversalDate());
                accrual.setLiabilityOrAssetAccountCode(request.liabilityOrAssetAccountCode());
                accrual.setExpenseOrRevenueAccountCode(request.expenseOrRevenueAccountCode());
                
                Accrual updated = repository.save(accrual);
                return ResponseEntity.ok(updated);
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAccrual(@PathVariable Long id) {
        if (repository.existsById(id)) {
            repository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    private JournalEntry createAccrualJournalEntry(Accrual accrual) {
        JournalEntry entry = new JournalEntry();
        entry.setDescription("Accrual: " + accrual.getDescription());
        entry.setDate(java.time.LocalDateTime.now());
        
        if ("EXPENSE".equalsIgnoreCase(accrual.getType())) {
            entry.setDebitAmount(accrual.getAmount());
            entry.setAccountCode(accrual.getExpenseOrRevenueAccountCode());
        } else if ("REVENUE".equalsIgnoreCase(accrual.getType())) {
            entry.setCreditAmount(accrual.getAmount());
            entry.setAccountCode(accrual.getExpenseOrRevenueAccountCode());
        }
        
        entry.setAmount(accrual.getAmount());
        entry.setType("ACCRUAL");
        entry.setReferenceNumber("ACCRUAL-" + accrual.getId());
        entry.setAccrualId(accrual.getId());
        
        return entry;
    }

    private JournalEntry createReversalJournalEntry(Accrual accrual) {
        JournalEntry entry = new JournalEntry();
        entry.setDescription("Reversal: " + accrual.getDescription());
        entry.setDate(java.time.LocalDateTime.now());
        
        if ("EXPENSE".equalsIgnoreCase(accrual.getType())) {
            entry.setCreditAmount(accrual.getAmount());
            entry.setAccountCode(accrual.getExpenseOrRevenueAccountCode());
        } else if ("REVENUE".equalsIgnoreCase(accrual.getType())) {
            entry.setDebitAmount(accrual.getAmount());
            entry.setAccountCode(accrual.getExpenseOrRevenueAccountCode());
        }
        
        entry.setAmount(accrual.getAmount());
        entry.setType("ACCRUAL_REVERSAL");
        entry.setReferenceNumber("REV-" + accrual.getJournalEntryId());
        entry.setAccrualId(accrual.getId());
        
        return entry;
    }

    public record AccrualRequest(
        String type, 
        String description,
        BigDecimal amount,
        LocalDate accrualDate,
        LocalDate reversalDate,
        String liabilityOrAssetAccountCode,
        String expenseOrRevenueAccountCode
    ) {}

    public record AccrualResponse(
        Long id,
        String type,
        String description,
        BigDecimal amount,
        LocalDate accrualDate,
        LocalDate reversalDate,
        Boolean isReversed,
        String liabilityOrAssetAccountCode,
        String expenseOrRevenueAccountCode,
        Long journalEntryId
    ) {}
}
