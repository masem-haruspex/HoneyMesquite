package org.mm.FinanceTracker.Banking;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class OutstandingReconciliationItemService {

    @Autowired
    private OutstandingReconciliationItemRepository outstandingReconciliationItemRepository;

    public List<OutstandingReconciliationItem> getAllOutstandingItems() {
        return outstandingReconciliationItemRepository.findAllOrdered();
    }

    public List<OutstandingReconciliationItem> getOutstandingItemsByBankAccount(String bankAccount) {
        return outstandingReconciliationItemRepository.findByBankAccount(bankAccount);
    }

    public List<OutstandingReconciliationItem> getOutstandingItemsBySource(String source) {
        return outstandingReconciliationItemRepository.findBySource(source);
    }
}