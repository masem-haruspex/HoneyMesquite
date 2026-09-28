package org.mm.FinanceTracker.Accounting.services;

import org.mm.FinanceTracker.Accounting.GeneralLedgerBalance;
import org.mm.FinanceTracker.Accounting.GeneralLedgerBalanceId;
import org.mm.FinanceTracker.Accounting.GeneralLedgerBalanceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class GeneralLedgerBalanceService {

    @Autowired
    private GeneralLedgerBalanceRepository generalLedgerBalanceRepository;

    public List<GeneralLedgerBalance> getAllBalances() {
        return generalLedgerBalanceRepository.findAll();
    }

    public Optional<GeneralLedgerBalance> getBalanceById(GeneralLedgerBalanceId id) {
        return generalLedgerBalanceRepository.findById(id);
    }

    public List<GeneralLedgerBalance> getBalancesByAccountCode(String accountCode) {
        return generalLedgerBalanceRepository.findByAccountCode(accountCode);
    }

    public List<GeneralLedgerBalance> getBalancesByPeriodId(Integer periodId) {
        return generalLedgerBalanceRepository.findByPeriodId(periodId);
    }

    @Transactional
    public GeneralLedgerBalance createBalance(GeneralLedgerBalance balance) {
        balance.setUpdatedAt(LocalDateTime.now());
        return generalLedgerBalanceRepository.save(balance);
    }

    @Transactional
    public GeneralLedgerBalance updateBalance(GeneralLedgerBalanceId id, GeneralLedgerBalance balanceDetails) {
        GeneralLedgerBalance balance = generalLedgerBalanceRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("General Ledger Balance not found with id: " + id));
        
        balance.setDebitTotal(balanceDetails.getDebitTotal());
        balance.setCreditTotal(balanceDetails.getCreditTotal());
        balance.setBalance(balanceDetails.getBalance());
        balance.setUpdatedAt(LocalDateTime.now());
        
        return generalLedgerBalanceRepository.save(balance);
    }

    @Transactional
    public void deleteBalance(GeneralLedgerBalanceId id) {
        GeneralLedgerBalance balance = generalLedgerBalanceRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("General Ledger Balance not found with id: " + id));
        generalLedgerBalanceRepository.delete(balance);
    }
}