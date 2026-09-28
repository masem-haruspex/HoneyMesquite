package org.mm.FinanceTracker.Accounting.controllers;

import org.mm.FinanceTracker.Accounting.AccountLedger;
import org.mm.FinanceTracker.Accounting.AccountLedgerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/account-ledger")
public class AccountLedgerController {

    @Autowired
    private AccountLedgerRepository accountLedgerRepository;

    @GetMapping("/")
    public ResponseEntity<List<AccountLedger>> getAllLedgerEntries() {
        List<AccountLedger> entries = accountLedgerRepository.findAllOrdered();
        return entries.isEmpty()
            ? new ResponseEntity<>(HttpStatus.NO_CONTENT)
            : new ResponseEntity<>(entries, HttpStatus.OK);
    }

    @GetMapping("/account/{accountCode}")
    public ResponseEntity<List<AccountLedger>> getLedgerByAccount(
            @PathVariable String accountCode,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        
        List<AccountLedger> entries;
        if (startDate != null && endDate != null) {
            entries = accountLedgerRepository.findByAccountCodeAndDateBetween(accountCode, startDate, endDate);
        } else {
            entries = accountLedgerRepository.findByAccountCode(accountCode);
        }
        
        return entries.isEmpty()
            ? new ResponseEntity<>(HttpStatus.NO_CONTENT)
            : new ResponseEntity<>(entries, HttpStatus.OK);
    }
}