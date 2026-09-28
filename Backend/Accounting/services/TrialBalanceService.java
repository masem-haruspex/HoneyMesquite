package org.mm.FinanceTracker.Accounting.services;

import org.mm.FinanceTracker.Accounting.TrialBalance;
import org.mm.FinanceTracker.Accounting.TrialBalanceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class TrialBalanceService {

	@Autowired
	private TrialBalanceRepository trialBalanceRepository;

	public List<TrialBalance> getTrialBalance() {
		return trialBalanceRepository.findAllOrdered();
	}

	public Map<String, Object> getTrialBalanceSummary() {
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

		return summary;
	}
}
