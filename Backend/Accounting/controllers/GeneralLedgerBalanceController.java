package org.mm.FinanceTracker.Accounting.controllers;

import org.mm.FinanceTracker.Accounting.GeneralLedgerBalance;
import org.mm.FinanceTracker.Accounting.GeneralLedgerBalanceId;
import org.mm.FinanceTracker.Accounting.GeneralLedgerBalanceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/general-ledger-balances")
public class GeneralLedgerBalanceController {

    @Autowired
    private GeneralLedgerBalanceRepository generalLedgerBalanceRepository;

    @GetMapping("/")
    public ResponseEntity<List<GeneralLedgerBalance>> getAllBalances() {
        List<GeneralLedgerBalance> balances = new ArrayList<>();
        generalLedgerBalanceRepository.findAll().forEach(balances::add);
        return balances.isEmpty()
            ? new ResponseEntity<>(HttpStatus.NO_CONTENT)
            : new ResponseEntity<>(balances, HttpStatus.OK);
    }

    @GetMapping("/{accountCode}/{periodId}")
    public ResponseEntity<GeneralLedgerBalance> getBalanceById(
            @PathVariable String accountCode, 
            @PathVariable Integer periodId) {
        
        GeneralLedgerBalanceId id = new GeneralLedgerBalanceId(accountCode, periodId);
        Optional<GeneralLedgerBalance> balance = generalLedgerBalanceRepository.findById(id);
        return balance.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
            .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @PostMapping("/")
    public ResponseEntity<GeneralLedgerBalance> createBalance(@Valid @RequestBody GeneralLedgerBalance balance) {
        GeneralLedgerBalance savedBalance = generalLedgerBalanceRepository.save(balance);
        return new ResponseEntity<>(savedBalance, HttpStatus.CREATED);
    }

    @PutMapping("/{accountCode}/{periodId}")
    public ResponseEntity<GeneralLedgerBalance> updateBalance(
            @PathVariable String accountCode, 
            @PathVariable Integer periodId,
            @Valid @RequestBody GeneralLedgerBalance balanceDetails) {
        
        GeneralLedgerBalanceId id = new GeneralLedgerBalanceId(accountCode, periodId);
        Optional<GeneralLedgerBalance> existingBalanceOpt = generalLedgerBalanceRepository.findById(id);
        
        if (existingBalanceOpt.isPresent()) {
            GeneralLedgerBalance existingBalance = existingBalanceOpt.get();
            existingBalance.setDebitTotal(balanceDetails.getDebitTotal());
            existingBalance.setCreditTotal(balanceDetails.getCreditTotal());
            existingBalance.setBalance(balanceDetails.getBalance());
            
            GeneralLedgerBalance updatedBalance = generalLedgerBalanceRepository.save(existingBalance);
            return new ResponseEntity<>(updatedBalance, HttpStatus.OK);
        } else {
            balanceDetails.setId(id);
            GeneralLedgerBalance savedBalance = generalLedgerBalanceRepository.save(balanceDetails);
            return new ResponseEntity<>(savedBalance, HttpStatus.CREATED);
        }
    }

    @DeleteMapping("/{accountCode}/{periodId}")
    public ResponseEntity<HttpStatus> deleteBalance(
            @PathVariable String accountCode, 
            @PathVariable Integer periodId) {
        try {
            GeneralLedgerBalanceId id = new GeneralLedgerBalanceId(accountCode, periodId);
            generalLedgerBalanceRepository.deleteById(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
