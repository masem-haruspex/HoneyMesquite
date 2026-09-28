package org.mm.FinanceTracker.Accounting.controllers;

import org.mm.FinanceTracker.Accounting.JournalEntry;
import org.mm.FinanceTracker.Accounting.JournalEntryDTO;
import org.mm.FinanceTracker.Accounting.services.AccountingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/journal-entries")
public class JournalEntryController {

    @Autowired
    private AccountingService accountingService;

    @GetMapping("/")
    public ResponseEntity<List<JournalEntry>> getAllEntries() {
        List<JournalEntry> entries = accountingService.getJournalEntriesByAccount(null, null, null);
        return entries.isEmpty()
            ? ResponseEntity.noContent().build()
            : ResponseEntity.ok(entries);
    }

    @GetMapping("/{id}")
    public ResponseEntity<JournalEntry> getEntryById(@PathVariable Long id) {
        JournalEntry entry = accountingService.getJournalEntryById(id);
        return entry != null
            ? ResponseEntity.ok(entry)
            : ResponseEntity.notFound().build();
    }

    @GetMapping("/account/{accountCode}")
    public ResponseEntity<List<JournalEntry>> getEntriesByAccount(
            @PathVariable String accountCode,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        
        List<JournalEntry> entries = accountingService.getJournalEntriesByAccount(accountCode, start, end);
        return ResponseEntity.ok(entries);
    }

    @PostMapping("/")
    public ResponseEntity<JournalEntry> createEntry(@RequestBody JournalEntryDTO entryDTO) {
        JournalEntry entry = convertToEntity(entryDTO);
        JournalEntry saved = accountingService.createJournalEntry(entry);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PostMapping("/batch")
    public ResponseEntity<Void> createBatchEntries(@RequestBody List<JournalEntryDTO> entryDTOs) {
        List<JournalEntry> entries = entryDTOs.stream()
            .map(this::convertToEntity)
            .toList();
        accountingService.batchPostJournalEntries(entries);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @PostMapping("/batch/validate")
    public ResponseEntity<Map<String, Object>> validateBatch(@RequestBody List<Long> journalIds) {
        Map<String, Object> result = accountingService.validateJournalBatch(journalIds);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/batch/reconcile")
    public ResponseEntity<Void> batchReconcile(@RequestBody List<Long> entryIds) {
        accountingService.reconcileJournalEntries(entryIds);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<JournalEntry> updateEntry(@PathVariable Long id, @RequestBody JournalEntryDTO entryDTO) {
        JournalEntry entry = convertToEntity(entryDTO);
        entry.setId(id);
        JournalEntry updated = accountingService.updateJournalEntry(entry);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEntry(@PathVariable Long id) {
        accountingService.deleteJournalEntry(id);
        return ResponseEntity.noContent().build();
    }



    @GetMapping("/unreconciled")
    public ResponseEntity<List<JournalEntry>> getUnreconciledEntries() {
        List<JournalEntry> entries = accountingService.getUnreconciledJournalEntries();
        return ResponseEntity.ok(entries);
    }

    private JournalEntry convertToEntity(JournalEntryDTO dto) {
        JournalEntry entry = new JournalEntry();
        entry.setDescription(dto.description());
        entry.setAmount(dto.amount());
        entry.setType(dto.type());
        entry.setAccountCode(dto.accountCode());
        entry.setDebitAmount(dto.debitAmount());
        entry.setCreditAmount(dto.creditAmount());
        entry.setReferenceNumber(dto.referenceNumber());
        entry.setBankAccountId(dto.bankAccountId());
        return entry;
    }
}
