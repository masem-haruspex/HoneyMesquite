package org.mm.FinanceTracker.Banking;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/outstanding-reconciliation-items")
public class OutstandingReconciliationItemController {

    @Autowired
    private OutstandingReconciliationItemRepository outstandingReconciliationItemRepository;

    @GetMapping("/")
    public ResponseEntity<List<OutstandingReconciliationItem>> getAllOutstandingItems() {
        List<OutstandingReconciliationItem> items = outstandingReconciliationItemRepository.findAllOrdered();
        return items.isEmpty()
            ? new ResponseEntity<>(HttpStatus.NO_CONTENT)
            : new ResponseEntity<>(items, HttpStatus.OK);
    }

    @GetMapping("/by-bank-account")
    public ResponseEntity<List<OutstandingReconciliationItem>> getByBankAccount(@RequestParam String bankAccount) {
        List<OutstandingReconciliationItem> items = outstandingReconciliationItemRepository.findByBankAccount(bankAccount);
        return items.isEmpty()
            ? new ResponseEntity<>(HttpStatus.NO_CONTENT)
            : new ResponseEntity<>(items, HttpStatus.OK);
    }

    @GetMapping("/by-source")
    public ResponseEntity<List<OutstandingReconciliationItem>> getBySource(@RequestParam String source) {
        List<OutstandingReconciliationItem> items = outstandingReconciliationItemRepository.findBySource(source);
        return items.isEmpty()
            ? new ResponseEntity<>(HttpStatus.NO_CONTENT)
            : new ResponseEntity<>(items, HttpStatus.OK);
    }
}