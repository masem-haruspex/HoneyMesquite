package org.mm.FinanceTracker.Banking;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/bank-accounts")
public class BankAccountController {

    @Autowired
    private BankAccountRepository repository;

    @GetMapping("/")
    public ResponseEntity<List<BankAccount>> getAllAccounts() {
        List<BankAccount> accounts = repository.findAll();
        return accounts.isEmpty()
            ? ResponseEntity.noContent().build()
            : ResponseEntity.ok(accounts);
    }

    @GetMapping("/active")
    public ResponseEntity<List<BankAccount>> getActiveAccounts() {
        List<BankAccount> accounts = repository.findByIsActiveTrue();
        return ResponseEntity.ok(accounts);
    }

    @GetMapping("/{id}")
    public ResponseEntity<BankAccount> getAccountById(@PathVariable Integer id) {
        return repository.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/")
    public ResponseEntity<BankAccount> createAccount(@RequestBody BankAccountDTO accountDTO) {
        BankAccount account = new BankAccount(
            accountDTO.name(),
            accountDTO.bankName(),
            accountDTO.accountNumber(),
            accountDTO.routingNumber(),
            accountDTO.accountType(),
            accountDTO.currency(),
            accountDTO.openingBalance()
        );

        BankAccount saved = repository.save(account);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<BankAccount> updateAccount(
            @PathVariable Integer id,
            @RequestBody BankAccountDTO accountDTO) {

        return repository.findById(id)
            .map(existing -> {
                existing.setName(accountDTO.name());
                existing.setBankName(accountDTO.bankName());
                existing.setAccountNumber(accountDTO.accountNumber());
                existing.setRoutingNumber(accountDTO.routingNumber());
                existing.setAccountType(accountDTO.accountType());
                existing.setCurrency(accountDTO.currency());

                BankAccount updated = repository.save(existing);
                return ResponseEntity.ok(updated);
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAccount(@PathVariable Integer id) {
        if (repository.existsById(id)) {
            repository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
