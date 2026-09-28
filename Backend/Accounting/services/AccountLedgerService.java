package org.mm.FinanceTracker.Accounting.services;

import org.mm.FinanceTracker.Accounting.AccountLedger;
import org.mm.FinanceTracker.Accounting.AccountLedgerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AccountLedgerService {

    @Autowired
    private AccountLedgerRepository accountLedgerRepository;

    public List<AccountLedger> getAllLedgerEntries() {
        return accountLedgerRepository.findAllOrdered();
    }

    public List<AccountLedger> getLedgerByAccount(String accountCode) {
        return accountLedgerRepository.findByAccountCode(accountCode);
    }

    public List<AccountLedger> getLedgerByAccountAndDateRange(String accountCode, LocalDateTime startDate, LocalDateTime endDate) {
        return accountLedgerRepository.findByAccountCodeAndDateBetween(accountCode, startDate, endDate);
    }
}