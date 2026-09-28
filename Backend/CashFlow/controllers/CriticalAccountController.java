package org.mm.FinanceTracker.CashFlow.controllers;

import org.mm.FinanceTracker.CashFlow.models.CriticalAccount;
import org.mm.FinanceTracker.CashFlow.repositories.CriticalAccountRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/critical-accounts")
public class CriticalAccountController {

    @Autowired
    private CriticalAccountRepository criticalAccountRepository;

    @GetMapping("/")
    public ResponseEntity<List<CriticalAccount>> getAllCriticalAccounts() {
        List<CriticalAccount> accounts = criticalAccountRepository.findAll();
        return accounts.isEmpty()
            ? new ResponseEntity<>(HttpStatus.NO_CONTENT)
            : new ResponseEntity<>(accounts, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CriticalAccount> getCriticalAccountById(@PathVariable Long id) {
        Optional<CriticalAccount> account = criticalAccountRepository.findById(id);
        return account.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
            .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @PostMapping("/")
    public ResponseEntity<CriticalAccount> createCriticalAccount(@RequestBody CriticalAccount account) {
        CriticalAccount savedAccount = criticalAccountRepository.save(account);
        return new ResponseEntity<>(savedAccount, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CriticalAccount> updateCriticalAccount(@PathVariable Long id, @RequestBody CriticalAccount accountDetails) {
        Optional<CriticalAccount> existingAccountOpt = criticalAccountRepository.findById(id);
        
        if (existingAccountOpt.isPresent()) {
            CriticalAccount existingAccount = existingAccountOpt.get();
            existingAccount.setLiquidityEvent(accountDetails.getLiquidityEvent());
            existingAccount.setName(accountDetails.getName());
            existingAccount.setBalance(accountDetails.getBalance());
            existingAccount.setMinThreshold(accountDetails.getMinThreshold());
            
            CriticalAccount updatedAccount = criticalAccountRepository.save(existingAccount);
            return new ResponseEntity<>(updatedAccount, HttpStatus.OK);
        } else {
            accountDetails.setId(id);
            CriticalAccount savedAccount = criticalAccountRepository.save(accountDetails);
            return new ResponseEntity<>(savedAccount, HttpStatus.CREATED);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<HttpStatus> deleteCriticalAccount(@PathVariable Long id) {
        try {
            criticalAccountRepository.deleteById(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/below-threshold")
    public ResponseEntity<List<CriticalAccount>> getBelowThresholdAccounts() {
        List<CriticalAccount> accounts = criticalAccountRepository.findBelowThreshold();
        return accounts.isEmpty()
            ? new ResponseEntity<>(HttpStatus.NO_CONTENT)
            : new ResponseEntity<>(accounts, HttpStatus.OK);
    }

    @GetMapping("/by-date")
    public ResponseEntity<List<CriticalAccount>> getAccountsByDate(@RequestParam LocalDate date) {
        List<CriticalAccount> accounts = criticalAccountRepository.findByLiquidityEventDate(date);
        return accounts.isEmpty()
            ? new ResponseEntity<>(HttpStatus.NO_CONTENT)
            : new ResponseEntity<>(accounts, HttpStatus.OK);
    }
}