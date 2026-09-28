package org.mm.FinanceTracker.Accounting.controllers;

import org.mm.FinanceTracker.Accounting.AccountingPeriod;
import org.mm.FinanceTracker.Accounting.AccountingPeriodDTO;
import org.mm.FinanceTracker.Accounting.services.AccountingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/accounting-periods")
public class AccountingPeriodController {
    
    @Autowired
    private AccountingService accountingService;
    
    @GetMapping("/")
    public ResponseEntity<List<AccountingPeriod>> getAllPeriods() {
        List<AccountingPeriod> periods = accountingService.getAllAccountingPeriods();
        return ResponseEntity.ok(periods);
    }
    
    @GetMapping("/open")
    public ResponseEntity<List<AccountingPeriod>> getOpenPeriods() {
        List<AccountingPeriod> periods = accountingService.getOpenAccountingPeriods();
        return ResponseEntity.ok(periods);
    }
    
    @PostMapping("/")
    public ResponseEntity<AccountingPeriod> createPeriod(
            @RequestBody AccountingPeriodDTO periodDTO) {
        AccountingPeriod period = convertToEntity(periodDTO);
        AccountingPeriod saved = accountingService.createAccountingPeriod(period);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }
    
    @PutMapping("/{id}/close")
    public ResponseEntity<AccountingPeriod> closePeriod(
            @PathVariable Integer id,
            @RequestParam String closedBy) {
        
        AccountingPeriod updated = accountingService.closeAccountingPeriod(id, closedBy);
        return ResponseEntity.ok(updated);
    }
    
    @GetMapping("/current")
    public ResponseEntity<AccountingPeriod> getCurrentPeriod() {
        AccountingPeriod period = accountingService.getCurrentAccountingPeriod();
        return period != null
            ? ResponseEntity.ok(period)
            : ResponseEntity.notFound().build();
    }
    
    @GetMapping("/date-range")
    public ResponseEntity<List<AccountingPeriod>> getPeriodsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end) {
        
        List<AccountingPeriod> periods = accountingService.getAccountingPeriodsByDateRange(start, end);
        return ResponseEntity.ok(periods);
    }
    
    @PostMapping("/{id}/reopen")
    public ResponseEntity<AccountingPeriod> reopenPeriod(
            @PathVariable Integer id,
            @RequestParam String reopenedBy) {
        
        AccountingPeriod period = accountingService.reopenAccountingPeriod(id, reopenedBy);
        return ResponseEntity.ok(period);
    }
    
    @GetMapping("/{id}/status")
    public ResponseEntity<Map<String, Object>> getPeriodStatus(@PathVariable Integer id) {
        Map<String, Object> status = accountingService.getAccountingPeriodStatus(id);
        return ResponseEntity.ok(status);
    }
    
    private AccountingPeriod convertToEntity(AccountingPeriodDTO dto) {
        AccountingPeriod period = new AccountingPeriod();
        period.setPeriodName(dto.periodName());
        period.setPeriodStart(dto.periodStart());
        period.setPeriodEnd(dto.periodEnd());
        period.setPeriodType(dto.periodType());
        period.setStatus("OPEN");
        return period;
    }
}
