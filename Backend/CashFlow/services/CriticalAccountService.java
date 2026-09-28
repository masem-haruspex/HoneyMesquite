package org.mm.FinanceTracker.CashFlow.services;

import org.mm.FinanceTracker.CashFlow.models.CriticalAccount;
import org.mm.FinanceTracker.CashFlow.repositories.CriticalAccountRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class CriticalAccountService {

    @Autowired
    private CriticalAccountRepository criticalAccountRepository;

    public List<CriticalAccount> getAllCriticalAccounts() {
        return criticalAccountRepository.findAll();
    }

    public Optional<CriticalAccount> getCriticalAccountById(Long id) {
        return criticalAccountRepository.findById(id);
    }

    @Transactional
    public CriticalAccount createCriticalAccount(CriticalAccount account) {
        return criticalAccountRepository.save(account);
    }

    @Transactional
    public CriticalAccount updateCriticalAccount(Long id, CriticalAccount accountDetails) {
        CriticalAccount account = criticalAccountRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Critical Account not found with id: " + id));
        
        account.setLiquidityEvent(accountDetails.getLiquidityEvent());
        account.setName(accountDetails.getName());
        account.setBalance(accountDetails.getBalance());
        account.setMinThreshold(accountDetails.getMinThreshold());
        
        return criticalAccountRepository.save(account);
    }

    @Transactional
    public void deleteCriticalAccount(Long id) {
        CriticalAccount account = criticalAccountRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Critical Account not found with id: " + id));
        criticalAccountRepository.delete(account);
    }

    public List<CriticalAccount> getBelowThresholdAccounts() {
        return criticalAccountRepository.findBelowThreshold();
    }

    public List<CriticalAccount> getAccountsByDate(LocalDate date) {
        return criticalAccountRepository.findByLiquidityEventDate(date);
    }
}