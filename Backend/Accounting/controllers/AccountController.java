package org.mm.FinanceTracker.Accounting.controllers;

import org.mm.FinanceTracker.Accounting.Account;
import org.mm.FinanceTracker.Accounting.AccountDTO;
import org.mm.FinanceTracker.Accounting.services.AccountingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/api/accounts")
public class AccountController {

    @Autowired
    private AccountingService accountingService;

    @GetMapping("/")
    public ResponseEntity<List<Account>> getAllAccounts() {
        List<Account> accounts = accountingService.getAllAccounts();
        return accounts.isEmpty()
            ? ResponseEntity.noContent().build()
            : ResponseEntity.ok(accounts);
    }

    @GetMapping("/active")
    public ResponseEntity<List<Account>> getActiveAccounts() {
        List<Account> accounts = accountingService.getActiveAccounts();
        return ResponseEntity.ok(accounts);
    }

    @GetMapping("/type/{type}")
    public ResponseEntity<List<Account>> getAccountsByType(@PathVariable String type) {
        validateAccountType(type);
        List<Account> accounts = accountingService.getAccountsByType(type);
        return ResponseEntity.ok(accounts);
    }

    @GetMapping("/parent/{parentCode}")
    public ResponseEntity<List<Account>> getChildAccounts(@PathVariable String parentCode) {
        List<Account> accounts = accountingService.getChildAccounts(parentCode);
        return ResponseEntity.ok(accounts);
    }

    @GetMapping("/{code}")
    public ResponseEntity<Account> getAccountByCode(@PathVariable String code) {
        Account account = accountingService.getAccountByCode(code);
        return account != null
            ? ResponseEntity.ok(account)
            : ResponseEntity.notFound().build();
    }

    @PostMapping("/")
    public ResponseEntity<Account> createAccount(@RequestBody AccountDTO accountDTO) {
        Account account = convertToEntity(accountDTO);
        Account saved = accountingService.createAccount(account);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{code}")
    public ResponseEntity<Account> updateAccount(
            @PathVariable String code,
            @RequestBody AccountDTO accountDTO) {
        
        Account existing = accountingService.getAccountByCode(code);
        if (existing == null) {
            Account newAccount = convertToEntity(accountDTO);
            newAccount.setCode(code);
            Account created = accountingService.createAccount(newAccount);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        }
        
        Account updated = updateEntity(existing, accountDTO);
        accountingService.updateAccount(updated);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{code}")
    public ResponseEntity<Void> deleteAccount(@PathVariable String code) {
        accountingService.deactivateAccount(code);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/chart-of-accounts")
    public ResponseEntity<List<Account>> getChartOfAccounts() {
        List<Account> accounts = accountingService.getChartOfAccounts();
        return ResponseEntity.ok(accounts);
    }

    private void validateAccountType(String type) {
        if (!Arrays.asList("ASSET", "LIABILITY", "EQUITY", "REVENUE", "EXPENSE")
                .contains(type.toUpperCase())) {
            throw new IllegalArgumentException("Invalid account type: " + type);
        }
    }

    private Account convertToEntity(AccountDTO dto) {
        Account account = new Account();
        account.setCode(dto.code());
        account.setName(dto.name());
        account.setType(dto.type());
        account.setParentCode(dto.parentCode());
        account.setNormalBalance(dto.normalBalance());
        account.setIsActive(dto.isActive() != null ? dto.isActive() : true);
        account.setCreatedAt(LocalDateTime.now());
        account.setUpdatedAt(LocalDateTime.now());
        return account;
    }

    private Account updateEntity(Account existing, AccountDTO dto) {
        existing.setName(dto.name());
        existing.setType(dto.type());
        existing.setParentCode(dto.parentCode());
        existing.setNormalBalance(dto.normalBalance());
        if (dto.isActive() != null) {
            existing.setIsActive(dto.isActive());
        }
        existing.setUpdatedAt(LocalDateTime.now());
        return existing;
    }
}
