package org.mm.FinanceTracker.Accounting.services;

import org.mm.FinanceTracker.Accounting.Loan;
import org.mm.FinanceTracker.Accounting.LoanRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class LoanService {

    @Autowired
    private LoanRepository loanRepository;

    public List<Loan> getAllLoans() {
        return loanRepository.findAll();
    }

    public Optional<Loan> getLoanById(Long id) {
        return loanRepository.findById(id);
    }

    @Transactional
    public Loan createLoan(Loan loan) {
        loan.setCreatedAt(LocalDateTime.now());
        return loanRepository.save(loan);
    }

    @Transactional
    public Loan updateLoan(Long id, Loan loanDetails) {
        Loan loan = loanRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Loan not found with id: " + id));
        
        loan.setLenderName(loanDetails.getLenderName());
        loan.setLoanNumber(loanDetails.getLoanNumber());
        loan.setPrincipalAmount(loanDetails.getPrincipalAmount());
        loan.setOutstandingBalance(loanDetails.getOutstandingBalance());
        loan.setInterestRate(loanDetails.getInterestRate());
        loan.setStartDate(loanDetails.getStartDate());
        loan.setMaturityDate(loanDetails.getMaturityDate());
        loan.setPaymentFrequency(loanDetails.getPaymentFrequency());
        loan.setNextPaymentDate(loanDetails.getNextPaymentDate());
        loan.setStatus(loanDetails.getStatus());
        loan.setLiabilityAccountCode(loanDetails.getLiabilityAccountCode());
        loan.setInterestExpenseAccountCode(loanDetails.getInterestExpenseAccountCode());
        loan.setUpdatedAt(LocalDateTime.now());
        
        return loanRepository.save(loan);
    }

    @Transactional
    public void deleteLoan(Long id) {
        Loan loan = loanRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Loan not found with id: " + id));
        loanRepository.delete(loan);
    }

    public Loan recordLoanPayment(Long loanId, java.math.BigDecimal paymentAmount) {
        Loan loan = loanRepository.findById(loanId)
            .orElseThrow(() -> new RuntimeException("Loan not found"));

        java.math.BigDecimal newBalance = loan.getOutstandingBalance().subtract(paymentAmount);
        
        if (newBalance.compareTo(java.math.BigDecimal.ZERO) <= 0) {
            loan.setStatus("PAID_OFF");
            loan.setOutstandingBalance(java.math.BigDecimal.ZERO);
        } else {
            loan.setOutstandingBalance(newBalance);
            loan.setNextPaymentDate(calculateNextPaymentDate(loan));
        }

        return loanRepository.save(loan);
    }

    public Loan refinanceLoan(Long loanId, java.math.BigDecimal newInterestRate, LocalDate newMaturityDate) {
        Loan loan = loanRepository.findById(loanId)
            .orElseThrow(() -> new RuntimeException("Loan not found"));

        loan.setInterestRate(newInterestRate);
        
        if (newMaturityDate != null) {
            loan.setMaturityDate(newMaturityDate);
        }

        return loanRepository.save(loan);
    }

    private LocalDate calculateNextPaymentDate(Loan loan) {
        LocalDate nextDate = loan.getNextPaymentDate() != null ? 
            loan.getNextPaymentDate() : loan.getStartDate();
        
        switch (loan.getPaymentFrequency()) {
            case "MONTHLY":
                return nextDate.plusMonths(1);
            case "QUARTERLY":
                return nextDate.plusMonths(3);
            case "ANNUALLY":
                return nextDate.plusYears(1);
            default:
                return nextDate.plusMonths(1);
        }
    }
}
