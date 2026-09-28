package org.mm.FinanceTracker.Accounting.controllers;

import org.mm.FinanceTracker.Accounting.TrialBalance;
import org.mm.FinanceTracker.Accounting.TrialBalanceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/trial-balance")
public class TrialBalanceController {

	@Autowired
	private TrialBalanceRepository trialBalanceRepository;

	@GetMapping("/")
	public ResponseEntity<List<TrialBalance>> getTrialBalance() {
		List<TrialBalance> entries = trialBalanceRepository.findAllOrdered();
		return entries.isEmpty()
			? new ResponseEntity<>(HttpStatus.NO_CONTENT)
			: new ResponseEntity<>(entries, HttpStatus.OK);
	}

	@GetMapping("/summary")
	public ResponseEntity<Map<String, Object>> getTrialBalanceSummary() {
		var assets = trialBalanceRepository.getTotalAssets();
		var liabilities = trialBalanceRepository.getTotalLiabilities();
		var equity = trialBalanceRepository.getTotalEquity();
		var revenue = trialBalanceRepository.getTotalRevenue();
		var expenses = trialBalanceRepository.getTotalExpenses();
		var totalDebits = trialBalanceRepository.getTotalDebits();
		var totalCredits = trialBalanceRepository.getTotalCredits();

		Map<String, Object> summary = new java.util.HashMap<>();
		summary.put("totalAssets", assets != null ? assets : 0);
		summary.put("totalLiabilities", liabilities != null ? liabilities : 0);
		summary.put("totalEquity", equity != null ? equity : 0);
		summary.put("totalRevenue", revenue != null ? revenue : 0);
		summary.put("totalExpenses", expenses != null ? expenses : 0);
		summary.put("totalDebits", totalDebits != null ? totalDebits : 0);
		summary.put("totalCredits", totalCredits != null ? totalCredits : 0);
		summary.put("isBalanced", totalDebits != null && totalCredits != null
				&& totalDebits.compareTo(totalCredits) == 0);

		return ResponseEntity.ok(summary);

	}
}
