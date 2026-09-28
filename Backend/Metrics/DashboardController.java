package org.mm.FinanceTracker.Metrics;

import org.mm.FinanceTracker.Accounting.*;
import org.mm.FinanceTracker.CashFlow.models.LiquidityEventsView;
import org.mm.FinanceTracker.CashFlow.models.RunwayDataView;
import org.mm.FinanceTracker.CashFlow.repositories.LiquidityEventsViewRepository;
import org.mm.FinanceTracker.CashFlow.repositories.RunwayDataViewRepository;
import org.mm.FinanceTracker.Vendors.PayablesAging;
import org.mm.FinanceTracker.Vendors.PayablesAgingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.jdbc.core.JdbcTemplate;
import jakarta.persistence.EntityManager;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

	@Autowired
	private EntityManager entityManager;

	@Autowired
	private AccountingPeriodRepository accountingPeriodRepository;

	@Autowired
	private GeneralLedgerBalanceRepository generalLedgerBalanceRepository;

	@Autowired
	private AccountRepository accountRepository;

	@Autowired
	private FinancialHealthDashboardRepository financialHealthDashboardRepository;

	@Autowired
	private TrialBalanceRepository trialBalanceRepository;

	@Autowired
	private PayablesAgingRepository payablesAgingRepository;

	@Autowired
	private LiquidityEventsViewRepository liquidityEventsViewRepository;

	@Autowired
	private RunwayDataViewRepository runwayDataViewRepository;

	private final JdbcTemplate jdbcTemplate;

	@Autowired                                
	public DashboardController(JdbcTemplate jdbcTemplate) {
		this.jdbcTemplate = jdbcTemplate;
	}

	@PostMapping("/admin/refresh")
	public ResponseEntity<Void> refreshMetrics() {
		jdbcTemplate.execute("SELECT refresh_dashboard_metrics()");
		return ResponseEntity.ok().build();
	}

	@GetMapping("/financial-health")
	public ResponseEntity<FinancialHealthDashboard> getFinancialHealth() {
		var result = financialHealthDashboardRepository.findLatest();
		return result.map(ResponseEntity::ok)
			.orElse(ResponseEntity.noContent().build());
	}

	@GetMapping("/financial-health/history")
	public ResponseEntity<List<FinancialHealthDashboard>> getFinancialHealthHistory(
			@RequestParam(required = false) LocalDate startDate,
			@RequestParam(required = false) LocalDate endDate) {

			List<FinancialHealthDashboard> result;
			if (startDate != null && endDate != null) {
				result = financialHealthDashboardRepository.findByDateRange(startDate, endDate);
			} else {
				result = financialHealthDashboardRepository.findAll();
			}

			return result.isEmpty()
				? ResponseEntity.noContent().build()
				: ResponseEntity.ok(result);
			}

	@GetMapping("/liquidity/detail")
	public ResponseEntity<LiquidityDetailResponse> getLiquidityDetail() {
		var period = accountingPeriodRepository
			.findByPeriodStartLessThanEqualAndPeriodEndGreaterThanEqual(LocalDate.now(), LocalDate.now())
			.orElseThrow(() -> new RuntimeException("No current accounting period"));

		var balances = generalLedgerBalanceRepository.findByPeriodId(period.getId());
		var currentAssets = new ArrayList<AccountBalance>();
		var currentLiabilities = new ArrayList<AccountBalance>();

		for (var b : balances) {
			var account = accountRepository.findById(b.getAccountCode()).orElse(null);
			if (account == null) continue;

			var item = new AccountBalance(account.getCode(), account.getName(), b.getBalance());

			if ("ASSET".equals(account.getType()) && account.getCode().compareTo("2000") < 0) {
				currentAssets.add(item);
			} else if ("LIABILITY".equals(account.getType()) && account.getCode().compareTo("3000") < 0) {
				currentLiabilities.add(item);
			}
		}

		return ResponseEntity.ok(new LiquidityDetailResponse(currentAssets, currentLiabilities));
	}

	@GetMapping("/trial-balance")
	public ResponseEntity<List<TrialBalance>> getTrialBalance() {
		var result = trialBalanceRepository.findAllOrdered();
		return result.isEmpty()
			? ResponseEntity.noContent().build()
			: ResponseEntity.ok(result);
	}

	@GetMapping("/trial-balance/summary")
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

	@GetMapping("/payables-aging")
	public ResponseEntity<List<PayablesAging>> getPayablesAging(
			@RequestParam(required = false) String bucket,
			@RequestParam(required = false) Long vendorId) {

			List<PayablesAging> result;
			if (bucket != null) {
				result = payablesAgingRepository.findByAgingBucket(bucket);
			} else if (vendorId != null) {
				result = payablesAgingRepository.findByVendorId(vendorId);
			} else {
				result = payablesAgingRepository.findAllOrderedByDaysOutstanding();
			}

			return result.isEmpty()
				? ResponseEntity.noContent().build()
				: ResponseEntity.ok(result);
			}

	@GetMapping("/payables-aging/summary")
	public ResponseEntity<List<Object[]>> getPayablesAgingSummary() {
		var result = payablesAgingRepository.getSummaryByAgingBucket();
		return result.isEmpty()
			? ResponseEntity.noContent().build()
			: ResponseEntity.ok(result);
	}

	@GetMapping("/liquidity-events")
	public ResponseEntity<List<LiquidityEventsView>> getLiquidityEvents(
			@RequestParam(required = false) LocalDate startDate,
			@RequestParam(required = false) LocalDate endDate) {

			List<LiquidityEventsView> result;
			if (startDate != null && endDate != null) {
				result = liquidityEventsViewRepository.findByDateRange(startDate, endDate);
			} else {
				result = liquidityEventsViewRepository.findAllOrderedByDate();
			}

			return result.isEmpty()
				? ResponseEntity.noContent().build()
				: ResponseEntity.ok(result);
			}

	@GetMapping("/runway-analysis")
	public ResponseEntity<List<RunwayDataView>> getRunwayAnalysis(
			@RequestParam(required = false) LocalDate startDate,
			@RequestParam(required = false) LocalDate endDate) {

			List<RunwayDataView> result;
			if (startDate != null && endDate != null) {
				result = runwayDataViewRepository.findByDateRange(startDate, endDate);
			} else {
				result = runwayDataViewRepository.findAllOrderedByDate();
			}

			return result.isEmpty()
				? ResponseEntity.noContent().build()
				: ResponseEntity.ok(result);
			}

	@GetMapping("/runway-analysis/status")
	public ResponseEntity<Map<String, Object>> getRunwayStatus() {
		var critical = runwayDataViewRepository.findCriticalRunway();
		var warning = runwayDataViewRepository.findWarningRunway();
		var healthy = runwayDataViewRepository.findHealthyRunway();
		var latest = runwayDataViewRepository.findLatest();

		Map<String, Object> status = new java.util.HashMap<>();
		status.put("criticalCount", critical.size());
		status.put("warningCount", warning.size());
		status.put("healthyCount", healthy.size());
		status.put("latestRunway", latest != null ? latest.getRunwayMonths() : 0);
		status.put("latestDate", latest != null ? latest.getDate() : null);
		status.put("status", latest != null
				? (latest.getRunwayMonths().doubleValue() < 3 ? "CRITICAL"
					: latest.getRunwayMonths().doubleValue() < 6 ? "WARNING" : "HEALTHY")
				: "UNKNOWN");

		return ResponseEntity.ok(status);
	}
}
