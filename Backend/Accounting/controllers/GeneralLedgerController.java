package org.mm.FinanceTracker.Accounting.controllers;

import org.mm.FinanceTracker.Accounting.GeneralLedgerBalance;
import org.mm.FinanceTracker.Accounting.services.AccountingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.time.LocalDateTime;
import org.springframework.format.annotation.DateTimeFormat;
import org.mm.FinanceTracker.Accounting.AccountLedger;

@RestController
@RequestMapping("/api/general-ledger")
public class GeneralLedgerController {

	@Autowired
	private AccountingService accountingService;

	@GetMapping("/period/{periodId}")
	public ResponseEntity<List<GeneralLedgerBalance>> getBalancesByPeriod(
			@PathVariable Integer periodId) {
			List<GeneralLedgerBalance> balances = accountingService.getGeneralLedgerBalancesByPeriod(periodId);
			return balances.isEmpty()
				? ResponseEntity.noContent().build()
				: ResponseEntity.ok(balances);
			}

	@GetMapping("/account/{accountCode}")
	public ResponseEntity<List<GeneralLedgerBalance>> getBalancesByAccount(
			@PathVariable String accountCode) {
			List<GeneralLedgerBalance> balances = accountingService.getGeneralLedgerBalancesByAccount(accountCode);
			return balances.isEmpty()
				? ResponseEntity.noContent().build()
				: ResponseEntity.ok(balances);
			}

	@GetMapping("/trial-balance/{periodId}")
	public ResponseEntity<org.mm.FinanceTracker.Accounting.TrialBalance> getTrialBalance(
			@PathVariable Integer periodId) {
			org.mm.FinanceTracker.Accounting.TrialBalance tb =
				accountingService.getTrialBalanceForPeriod(periodId);
			return tb == null
				? ResponseEntity.noContent().build()
				: ResponseEntity.ok(tb);
			}

	@GetMapping("/financial-position/{periodId}")
	public ResponseEntity<Map<String, Object>> getFinancialPosition(@PathVariable Integer periodId) {
		Map<String, Object> position = accountingService.getFinancialPosition(periodId);
		return ResponseEntity.ok(position);
	}

	@PostMapping("/recalculate/{periodId}")
	public ResponseEntity<Void> recalculateBalances(@PathVariable Integer periodId) {
		accountingService.recalculateGeneralLedgerBalances(periodId);
		return ResponseEntity.ok().build();
	}

	@GetMapping("/account-ledger/{accountCode}")
	public ResponseEntity<List<AccountLedger>> getAccountLedger(
			@PathVariable String accountCode,
			@RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
			@RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {

			List<AccountLedger> ledger = accountingService.getAccountLedger(accountCode, start, end);
			return ledger.isEmpty()
				? ResponseEntity.noContent().build()
				: ResponseEntity.ok(ledger);
			}
}
