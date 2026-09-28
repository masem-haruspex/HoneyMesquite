package org.mm.FinanceTracker.Banking;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class BankReconciliationService {

    @Autowired
    private BankAccountRepository bankAccountRepository;

    @Autowired
    private BankStatementRepository statementRepository;

    @Autowired
    private BankStatementLineRepository lineRepository;

    @Autowired
    private org.mm.FinanceTracker.Accounting.JournalEntryRepository journalEntryRepository;

    @Autowired
    private ReconciliationSessionRepository sessionRepository;

    @Transactional
    public ReconciliationSession startReconciliation(Integer bankAccountId,
                                                   Integer statementId,
                                                   String startedBy) {

        BankAccount account = bankAccountRepository.findById(bankAccountId)
            .orElseThrow(() -> new RuntimeException("Bank account not found"));

        BankStatement statement = statementRepository.findById(statementId)
            .orElseThrow(() -> new RuntimeException("Bank statement not found"));

        ReconciliationSession session = new ReconciliationSession();
        session.setBankAccount(account);
        session.setStatement(statement);
        session.setStartedBy(startedBy);
        session.setOpeningBookBalance(account.getCurrentBalance());
        session.setStatementBalance(statement.getClosingBalance());

        return sessionRepository.save(session);
    }

    @Transactional
    public ReconciliationSession completeReconciliation(Integer sessionId,
                                                       String notes) {

        ReconciliationSession session = sessionRepository.findById(sessionId)
            .orElseThrow(() -> new RuntimeException("Reconciliation session not found"));

        session.setCompletedAt(LocalDateTime.now());
        session.setStatus("COMPLETED");
        session.setNotes(notes);

        BankAccount account = session.getBankAccount();
        account.setCurrentBalance(session.getReconciledBalance());
        account.setLastReconciledDate(java.time.LocalDate.now());
        bankAccountRepository.save(account);

        BankStatement statement = session.getStatement();
        statement.setStatus("RECONCILED");
        statementRepository.save(statement);

        return sessionRepository.save(session);
    }

    public BigDecimal calculateVariance(ReconciliationSession session) {
        BigDecimal bookBalance = session.getOpeningBookBalance()
            .add(session.getOutstandingDeposits())
            .subtract(session.getOutstandingWithdrawals());

        return session.getStatementBalance().subtract(bookBalance);
    }
}
