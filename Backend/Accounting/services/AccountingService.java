package org.mm.FinanceTracker.Accounting.services;

import org.mm.FinanceTracker.Accounting.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Transactional
public class AccountingService {

	@Autowired
	private JdbcTemplate jdbcTemplate;

	@Autowired
	private JournalEntryRepository journalEntryRepository;

	@Autowired
	private AccountRepository accountRepository;

	@Autowired
	private AccountingPeriodRepository accountingPeriodRepository;

	@Autowired
	private GeneralLedgerBalanceRepository generalLedgerBalanceRepository;

	@Autowired
	private FixedAssetRepository fixedAssetRepository;

	@Autowired
	private LoanRepository loanRepository;

	@Autowired
	private AccrualRepository accrualRepository;

	@Autowired
	private EquityTransactionRepository equityTransactionRepository;

	@Autowired
	private TrialBalanceRepository trialBalanceRepository;

	@Autowired
	private AccountLedgerRepository accountLedgerRepository;

	public List<JournalEntry> getJournalEntriesByAccount(String accountCode, LocalDateTime start, LocalDateTime end) {
		return journalEntryRepository.findByAccountAndDateRange(accountCode, start, end);
	}

	public JournalEntry getJournalEntryById(Long id) {
		return journalEntryRepository.findById(id)
			.orElseThrow(() -> new RuntimeException("Journal Entry not found with id: " + id));
	}

	public JournalEntry createJournalEntry(JournalEntry entry) {
		AccountingPeriod currentPeriod = getCurrentAccountingPeriod();
		if (currentPeriod == null || !"OPEN".equals(currentPeriod.getStatus())) {
			throw new IllegalStateException("No open accounting period found");
		}

		validateDoubleEntry(entry);

		entry.setPeriodId(currentPeriod.getId());
		entry.setDate(LocalDateTime.now());
		entry.setCreatedAt(LocalDateTime.now());
		entry.setUpdatedAt(LocalDateTime.now());

		String nextNumber = generateJournalEntryNumber();
		entry.setJournalEntryNumber(nextNumber);

		return journalEntryRepository.save(entry);
	}

	public void batchPostJournalEntries(List<JournalEntry> entries) {
		for (JournalEntry entry : entries) {
			createJournalEntry(entry);
		}
	}

	public Map<String, Object> validateJournalBatch(List<Long> journalIds) {
		String sql = "SELECT * FROM validate_journal_batch(ARRAY[?]::bigint[])";
		return jdbcTemplate.queryForMap(sql, journalIds.toArray());
	}

	public void reconcileJournalEntries(List<Long> entryIds) {
		List<JournalEntry> entries = journalEntryRepository.findAllById(entryIds);
		entries.forEach(entry -> {
			entry.setReconciled(true);
			entry.setReconciledDate(LocalDate.now());
		});
		journalEntryRepository.saveAll(entries);
	}

	public Account createAccount(Account account) {
		validateAccountType(account.getType());
		account.setCreatedAt(LocalDateTime.now());
		account.setUpdatedAt(LocalDateTime.now());
		return accountRepository.save(account);
	}

	public void deactivateAccount(String accountCode) {
		Account account = accountRepository.findById(accountCode)
			.orElseThrow(() -> new IllegalArgumentException("Account not found: " + accountCode));
		account.setIsActive(false);
		accountRepository.save(account);
	}

	public AccountingPeriod getCurrentAccountingPeriod() {
		LocalDate today = LocalDate.now();
		return accountingPeriodRepository.findByPeriodStartLessThanEqualAndPeriodEndGreaterThanEqual(today, today)
			.orElse(null);
	}

	public AccountingPeriod closeAccountingPeriod(Integer periodId, String closedBy) {
		AccountingPeriod period = accountingPeriodRepository.findById(periodId)
			.orElseThrow(() -> new IllegalArgumentException("Accounting period not found"));

		if ("CLOSED".equals(period.getStatus())) {
			throw new IllegalStateException("Period is already closed");
		}

		List<JournalEntry> draftEntries = journalEntryRepository.findAll().stream()
			.filter(je -> "DRAFT".equals(je.getStatus()) && periodId.equals(je.getPeriodId()))
			.toList();

		if (!draftEntries.isEmpty()) {
			throw new IllegalStateException("Cannot close period with draft journal entries");
		}

		period.setStatus("CLOSED");
		period.setClosedAt(LocalDateTime.now());
		period.setClosedBy(closedBy);

		return accountingPeriodRepository.save(period);
	}

	public JournalEntry updateJournalEntry(JournalEntry entry) {
		entry.setUpdatedAt(LocalDateTime.now());
		return journalEntryRepository.save(entry);
	}

	public void deleteJournalEntry(Long id) {
		JournalEntry entry = journalEntryRepository.findById(id)
			.orElseThrow(() -> new RuntimeException("Journal Entry not found with id: " + id));
		journalEntryRepository.delete(entry);
	}


	public void updateGeneralLedgerBalance(String accountCode, Integer periodId) {
		List<JournalEntry> entries = journalEntryRepository.findByAccountCode(accountCode);
		BigDecimal totalDebits = entries.stream()
			.map(JournalEntry::getDebitAmount)
			.reduce(BigDecimal.ZERO, BigDecimal::add);
		BigDecimal totalCredits = entries.stream()
			.map(JournalEntry::getCreditAmount)
			.reduce(BigDecimal.ZERO, BigDecimal::add);

		GeneralLedgerBalance glBalance = generalLedgerBalanceRepository
			.findByAccountCodeAndPeriodId(accountCode, periodId)
			.orElse(new GeneralLedgerBalance(accountCode, periodId));

		glBalance.setDebitTotal(totalDebits);
		glBalance.setCreditTotal(totalCredits);

		Account account = accountRepository.findById(accountCode)
			.orElseThrow(() -> new IllegalArgumentException("Account not found"));

		BigDecimal balance;
		if ("DEBIT".equals(account.getNormalBalance())) {
			balance = totalDebits.subtract(totalCredits);
		} else {
			balance = totalCredits.subtract(totalDebits);
		}

		glBalance.setBalance(balance);
		glBalance.setUpdatedAt(LocalDateTime.now());

		generalLedgerBalanceRepository.save(glBalance);
	}

	public Map<String, Object> getFinancialPosition(Integer periodId) {
		BigDecimal totalAssets = generalLedgerBalanceRepository
			.getTotalBalanceByAccountType(periodId, "1");
		BigDecimal totalLiabilities = generalLedgerBalanceRepository
			.getTotalBalanceByAccountType(periodId, "2");
		BigDecimal totalEquity = generalLedgerBalanceRepository
			.getTotalBalanceByAccountType(periodId, "3");

		return Map.of(
				"totalAssets", totalAssets != null ? totalAssets : BigDecimal.ZERO,
				"totalLiabilities", totalLiabilities != null ? totalLiabilities : BigDecimal.ZERO,
				"totalEquity", totalEquity != null ? totalEquity : BigDecimal.ZERO,
				"balanceCheck", (totalAssets != null ? totalAssets : BigDecimal.ZERO)
				.subtract((totalLiabilities != null ? totalLiabilities : BigDecimal.ZERO)
					.add(totalEquity != null ? totalEquity : BigDecimal.ZERO))
				);
	}

	public List<FixedAsset> getAllFixedAssets() {
		return fixedAssetRepository.findAll();
	}

	public List<FixedAsset> getActiveFixedAssets() {
		return fixedAssetRepository.findAll().stream()
			.filter(asset -> !"RETIRED".equals(asset.getStatus()))
			.toList();
	}

	public FixedAsset getFixedAssetById(Long id) {
		return fixedAssetRepository.findById(id).orElse(null);
	}

	public FixedAsset createFixedAsset(FixedAsset asset) {
		asset.setNetBookValue(asset.getCost().subtract(asset.getAccumulatedDepreciation()));
		return fixedAssetRepository.save(asset);
	}

	public FixedAsset updateFixedAsset(Long id, FixedAsset assetDetails) {
		FixedAsset asset = fixedAssetRepository.findById(id)
			.orElseThrow(() -> new IllegalArgumentException("Fixed asset not found"));

		asset.setName(assetDetails.getName());
		asset.setDescription(assetDetails.getDescription());
		asset.setPurchaseDate(assetDetails.getPurchaseDate());
		asset.setCost(assetDetails.getCost());
		asset.setSalvageValue(assetDetails.getSalvageValue());
		asset.setUsefulLifeYears(assetDetails.getUsefulLifeYears());
		asset.setAccountCode(assetDetails.getAccountCode());
		asset.setNetBookValue(asset.getCost().subtract(asset.getAccumulatedDepreciation()));

		return fixedAssetRepository.save(asset);
	}

	public FixedAsset recordDepreciation(Long assetId, BigDecimal depreciationAmount) {
		FixedAsset asset = fixedAssetRepository.findById(assetId)
			.orElseThrow(() -> new IllegalArgumentException("Fixed asset not found"));

		BigDecimal newAccumulatedDepreciation = asset.getAccumulatedDepreciation()
			.add(depreciationAmount);

		if (asset.getCost().subtract(newAccumulatedDepreciation)
				.compareTo(asset.getSalvageValue()) <= 0) {
			asset.setStatus("FULLY_DEPRECIATED");
				}

		asset.setAccumulatedDepreciation(newAccumulatedDepreciation);
		asset.setNetBookValue(asset.getCost().subtract(asset.getAccumulatedDepreciation()));
		return fixedAssetRepository.save(asset);
	}

	public FixedAsset retireFixedAsset(Long id, BigDecimal salePrice, LocalDate retirementDate) {
		FixedAsset asset = fixedAssetRepository.findById(id)
			.orElseThrow(() -> new IllegalArgumentException("Fixed asset not found"));

		asset.setStatus("RETIRED");
		if (retirementDate != null) {
			asset.setRetirementDate(retirementDate);
		}
		if (salePrice != null) {
			asset.setSalePrice(salePrice);
		}

		return fixedAssetRepository.save(asset);
	}

	public List<Map<String, Object>> getDepreciationSchedule(Long id) {
		FixedAsset asset = fixedAssetRepository.findById(id)
			.orElseThrow(() -> new IllegalArgumentException("Fixed asset not found"));

		List<Map<String, Object>> schedule = new ArrayList<>();
		BigDecimal annualDepreciation = asset.getCost().subtract(asset.getSalvageValue())
			.divide(BigDecimal.valueOf(asset.getUsefulLifeYears()), 4, RoundingMode.HALF_UP);

		BigDecimal accumulatedDepreciation = BigDecimal.ZERO;
		BigDecimal bookValue = asset.getCost();

		for (int year = 1; year <= asset.getUsefulLifeYears(); year++) {
			accumulatedDepreciation = accumulatedDepreciation.add(annualDepreciation);
			bookValue = bookValue.subtract(annualDepreciation);

			Map<String, Object> entry = new HashMap<>();
			entry.put("year", year);
			entry.put("depreciation", annualDepreciation);
			entry.put("accumulatedDepreciation", accumulatedDepreciation);
			entry.put("bookValue", bookValue);

			schedule.add(entry);
		}

		return schedule;
	}

	public BigDecimal getTotalNetBookValue() {
		return fixedAssetRepository.findAll().stream()
			.filter(asset -> !"RETIRED".equals(asset.getStatus()))
			.map(FixedAsset::getNetBookValue)
			.reduce(BigDecimal.ZERO, BigDecimal::add);
	}

	public Map<String, BigDecimal> getNetBookValueByType() {
		return fixedAssetRepository.findAll().stream()
			.filter(asset -> !"RETIRED".equals(asset.getStatus()))
			.collect(Collectors.groupingBy(
						FixedAsset::getAccountCode,
						Collectors.reducing(
							BigDecimal.ZERO,
							FixedAsset::getNetBookValue,
							BigDecimal::add)));  
	}

	public Loan recordLoanPayment(Long loanId, BigDecimal paymentAmount) {
		Loan loan = loanRepository.findById(loanId)
			.orElseThrow(() -> new IllegalArgumentException("Loan not found"));

		BigDecimal newBalance = loan.getOutstandingBalance().subtract(paymentAmount);

		if (newBalance.compareTo(BigDecimal.ZERO) <= 0) {
			loan.setStatus("PAID_OFF");
			loan.setOutstandingBalance(BigDecimal.ZERO);
		} else {
			loan.setOutstandingBalance(newBalance);
			loan.setNextPaymentDate(calculateNextPaymentDate(loan));
		}

		return loanRepository.save(loan);
	}

	public Accrual createAccrual(Accrual accrual) {
		JournalEntry journalEntry = new JournalEntry();
		journalEntry.setDescription("Accrual: " + accrual.getDescription());
		journalEntry.setAmount(accrual.getAmount());
		journalEntry.setType(accrual.getType().equals("EXPENSE") ? "EXPENSE" : "INCOME");

		if (accrual.getType().equals("EXPENSE")) {
			journalEntry.setDebitAmount(accrual.getAmount());
			journalEntry.setAccountCode(accrual.getExpenseOrRevenueAccountCode());
		} else {
			journalEntry.setCreditAmount(accrual.getAmount());
			journalEntry.setAccountCode(accrual.getExpenseOrRevenueAccountCode());
		}

		JournalEntry savedEntry = createJournalEntry(journalEntry);
		accrual.setJournalEntryId(savedEntry.getId());

		return accrualRepository.save(accrual);
	}

	public void reverseAccrual(Long accrualId) {
		Accrual accrual = accrualRepository.findById(accrualId)
			.orElseThrow(() -> new IllegalArgumentException("Accrual not found"));

		if (accrual.getIsReversed()) {
			throw new IllegalStateException("Accrual is already reversed");
		}

		JournalEntry reversingEntry = new JournalEntry();
		reversingEntry.setDescription("Reversal: " + accrual.getDescription());
		reversingEntry.setAmount(accrual.getAmount());
		reversingEntry.setType(accrual.getType().equals("EXPENSE") ? "INCOME" : "EXPENSE");

		if (accrual.getType().equals("EXPENSE")) {
			reversingEntry.setCreditAmount(accrual.getAmount());
		} else {
			reversingEntry.setDebitAmount(accrual.getAmount());
		}

		reversingEntry.setAccountCode(accrual.getExpenseOrRevenueAccountCode());
		createJournalEntry(reversingEntry);

		accrual.setIsReversed(true);
		accrual.setReversalDate(LocalDate.now());
		accrualRepository.save(accrual);
	}

	public EquityTransaction recordEquityTransaction(EquityTransaction transaction) {
		JournalEntry journalEntry = new JournalEntry();
		journalEntry.setDescription("Equity: " + transaction.getType() + " - " + transaction.getDescription());
		journalEntry.setAmount(transaction.getAmount());
		journalEntry.setType("EQUITY");
		journalEntry.setAccountCode(transaction.getEquityAccountCode());

		if (transaction.getType().equals("CAPITAL_CONTRIBUTION")) {
			journalEntry.setCreditAmount(transaction.getAmount());
		} else if (transaction.getType().equals("OWNER_DRAW")) {
			journalEntry.setDebitAmount(transaction.getAmount());
		}

		JournalEntry savedEntry = createJournalEntry(journalEntry);
		transaction.setJournalEntryId(savedEntry.getId());

		return equityTransactionRepository.save(transaction);
	}

	public List<AccountLedger> getAccountLedger(String accountCode, LocalDateTime start, LocalDateTime end) {
		return accountLedgerRepository.findByAccountAndDateRange(accountCode, start, end);
	}

	public TrialBalance generateTrialBalance() {
		AccountingPeriod currentPeriod = getCurrentAccountingPeriod();
		if (currentPeriod != null) {
			List<Account> accounts = accountRepository.findByIsActiveTrue();
			for (Account account : accounts) {
				updateGeneralLedgerBalance(account.getCode(), currentPeriod.getId());
			}
		}

		return trialBalanceRepository.findAllOrdered().get(0); 
	}

	public List<Account> getAllAccounts() {
		return accountRepository.findAll();
	}

	public List<Account> getActiveAccounts() {
		return accountRepository.findByIsActiveTrue();
	}

	public List<Account> getAccountsByType(String type) {
		return accountRepository.findByType(type);
	}

	public List<Account> getChildAccounts(String parentCode) {
		return accountRepository.findByParentCode(parentCode);
	}

	public Account getAccountByCode(String code) {
		return accountRepository.findById(code).orElse(null);
	}

	public Account updateAccount(Account account) {
		account.setUpdatedAt(LocalDateTime.now());
		return accountRepository.save(account);
	}

	public List<Account> getChartOfAccounts() {
		return accountRepository.findByParentCodeIsNull();
	}

	public List<AccountingPeriod> getAllAccountingPeriods() {
		return accountingPeriodRepository.findAll();
	}

	public List<AccountingPeriod> getOpenAccountingPeriods() {
		return accountingPeriodRepository.findByStatus("OPEN");
	}

	public AccountingPeriod createAccountingPeriod(AccountingPeriod period) {
		period.setCreatedAt(LocalDateTime.now());
		period.setUpdatedAt(LocalDateTime.now());
		return accountingPeriodRepository.save(period);
	}

	public AccountingPeriod reopenAccountingPeriod(Integer id, String reopenedBy) {
		AccountingPeriod period = accountingPeriodRepository.findById(id)
			.orElseThrow(() -> new IllegalArgumentException("Accounting period not found"));

		period.setStatus("OPEN");
		period.setReopenedAt(LocalDateTime.now());
		period.setReopenedBy(reopenedBy);

		return accountingPeriodRepository.save(period);
	}

	public List<AccountingPeriod> getAccountingPeriodsByDateRange(LocalDate start, LocalDate end) {
		return accountingPeriodRepository.findByPeriodStartBetween(start, end);
	}

	public Map<String, Object> getAccountingPeriodStatus(Integer id) {
		AccountingPeriod period = accountingPeriodRepository.findById(id)
			.orElseThrow(() -> new IllegalArgumentException("Accounting period not found"));

		long entryCount = journalEntryRepository.countByPeriodId(id);

		Map<String, Object> status = new HashMap<>();
		status.put("periodId", period.getId());
		status.put("status", period.getStatus());
		status.put("entryCount", entryCount);
		status.put("startDate", period.getPeriodStart());
		status.put("endDate", period.getPeriodEnd());

		return status;
	}

	public List<JournalEntry> getUnreconciledJournalEntries() {
		return journalEntryRepository.findByReconciledFalse();
	}

	private void validateDoubleEntry(JournalEntry entry) {
		if (entry.getDebitAmount() == null && entry.getCreditAmount() == null) {
			throw new IllegalArgumentException("Journal entry must have either debit or credit amount");
		}
		if (entry.getDebitAmount() != null && entry.getDebitAmount().compareTo(BigDecimal.ZERO) > 0 &&
				entry.getCreditAmount() != null && entry.getCreditAmount().compareTo(BigDecimal.ZERO) > 0) {
			throw new IllegalArgumentException("Journal entry cannot have both debit and credit amounts");
				}
	}

	private String generateJournalEntryNumber() {
		Long count = journalEntryRepository.count();
		return String.format("JE-%06d", count + 1);
	}

	private void validateAccountType(String type) {
		try {
			AccountType.valueOf(type.toUpperCase());
		} catch (IllegalArgumentException e) {
			throw new IllegalArgumentException("Invalid account type: " + type);
		}
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

	public List<GeneralLedgerBalance> getGeneralLedgerBalancesByPeriod(Integer periodId) {
		return generalLedgerBalanceRepository.findByPeriodId(periodId);
	}

	public List<GeneralLedgerBalance> getGeneralLedgerBalancesByAccount(String accountCode) {
		return generalLedgerBalanceRepository.findByAccountCode(accountCode);
	}

	public TrialBalance getTrialBalanceForPeriod(Integer periodId) {
		return trialBalanceRepository.findByPeriodId(periodId)
			.orElseThrow(() -> new IllegalArgumentException("Trial balance not found for period: " + periodId));
	}

	@Transactional
	public void recalculateGeneralLedgerBalances(Integer periodId) {
		generalLedgerBalanceRepository.deleteByPeriodId(periodId);

		List<Account> accounts = accountRepository.findByIsActiveTrue();

		for (Account account : accounts) {
			updateGeneralLedgerBalance(account.getCode(), periodId);
		}
	}

	public List<Loan> getAllLoans() {
		return loanRepository.findAll();
	}

	public List<Loan> getActiveLoans() {
		return loanRepository.findByStatus("ACTIVE");
	}

	public Loan getLoanById(Long id) {
		return loanRepository.findById(id)
			.orElseThrow(() -> new IllegalArgumentException("Loan not found with id: " + id));
	}

	public Loan createLoan(Loan loan) {
		loan.setCreatedAt(LocalDateTime.now());
		loan.setUpdatedAt(LocalDateTime.now());
		if (loan.getStatus() == null) {
			loan.setStatus("ACTIVE");
		}
		if (loan.getOutstandingBalance() == null) {
			loan.setOutstandingBalance(loan.getPrincipalAmount());
		}
		return loanRepository.save(loan);
	}

	public Loan updateLoan(Long id, Loan loanDetails) {
		Loan loan = getLoanById(id);

		loan.setPrincipalAmount(loanDetails.getPrincipalAmount());
		loan.setInterestRate(loanDetails.getInterestRate());
		loan.setTermMonths(loanDetails.getTermMonths());
		loan.setStartDate(loanDetails.getStartDate());
		loan.setMaturityDate(loanDetails.getMaturityDate());
		loan.setPaymentFrequency(loanDetails.getPaymentFrequency());
		loan.setMonthlyPayment(loanDetails.getMonthlyPayment());
		loan.setLender(loanDetails.getLender());
		loan.setUpdatedAt(LocalDateTime.now());

		return loanRepository.save(loan);
	}

	public Loan refinanceLoan(Long id, BigDecimal newPrincipal, LocalDate refinanceDate) {
		Loan loan = getLoanById(id);

		JournalEntry journalEntry = new JournalEntry();
		journalEntry.setDescription("Loan refinancing - " + loan.getLender());
		journalEntry.setAmount(newPrincipal);
		journalEntry.setType("REFINANCE");
		journalEntry.setDate(LocalDateTime.now());

		loan.setPrincipalAmount(newPrincipal);
		loan.setOutstandingBalance(newPrincipal);
		loan.setRefinancedDate(refinanceDate);
		loan.setUpdatedAt(LocalDateTime.now());

		return loanRepository.save(loan);
	}

	public List<AmortizationSchedule> getLoanAmortizationSchedule(Long loanId) {
		Loan loan = getLoanById(loanId);

		List<AmortizationSchedule> schedule = new ArrayList<>();
		BigDecimal remainingBalance = loan.getPrincipalAmount();
		BigDecimal monthlyRate = loan.getInterestRate()
			.divide(BigDecimal.valueOf(100), 10, RoundingMode.HALF_UP)
			.divide(BigDecimal.valueOf(12), 10, RoundingMode.HALF_UP);

		LocalDate paymentDate = loan.getStartDate().plusMonths(1);

		for (int i = 1; i <= loan.getTermMonths(); i++) {
			AmortizationSchedule entry = new AmortizationSchedule();
			entry.setPaymentNumber(i);
			entry.setPaymentDate(paymentDate);

			BigDecimal interestPayment = remainingBalance.multiply(monthlyRate)
				.setScale(2, RoundingMode.HALF_UP);
			BigDecimal principalPayment = loan.getMonthlyPayment()
				.subtract(interestPayment)
				.setScale(2, RoundingMode.HALF_UP);

			if (i == loan.getTermMonths()) {
				principalPayment = remainingBalance;
				interestPayment = loan.getMonthlyPayment().subtract(principalPayment);
			}

			entry.setPrincipalPayment(principalPayment);
			entry.setInterestPayment(interestPayment);
			entry.setTotalPayment(principalPayment.add(interestPayment));
			entry.setRemainingBalance(remainingBalance.subtract(principalPayment)
					.setScale(2, RoundingMode.HALF_UP));

			schedule.add(entry);
			remainingBalance = remainingBalance.subtract(principalPayment);
			paymentDate = paymentDate.plusMonths(1);
		}

		return schedule;
	}

	public BigDecimal getTotalLoanOutstanding() {
		return loanRepository.findAll().stream()
			.filter(loan -> "ACTIVE".equals(loan.getStatus()))
			.map(Loan::getOutstandingBalance)
			.reduce(BigDecimal.ZERO, BigDecimal::add);
	}

	public List<Loan> getLoansWithUpcomingPayments(LocalDate startDate, LocalDate endDate) {
		return loanRepository.findByNextPaymentDateBetween(startDate, endDate);
	}

	public BigDecimal getLoanInterestExpenseForPeriod(Integer periodId) {
		AccountingPeriod period = accountingPeriodRepository.findById(periodId)
			.orElseThrow(() -> new IllegalArgumentException("Period not found"));

		List<JournalEntry> entries = journalEntryRepository.findByDateRange(
				period.getPeriodStart().atStartOfDay(),
				period.getPeriodEnd().atTime(23, 59, 59)
				);

		return entries.stream()
			.filter(entry -> "INTEREST_EXPENSE".equals(entry.getType()))
			.map(JournalEntry::getAmount)
			.reduce(BigDecimal.ZERO, BigDecimal::add);
	}

}
