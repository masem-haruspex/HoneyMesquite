package org.mm.FinanceTracker.Accounting.controllers;

import org.mm.FinanceTracker.Accounting.Loan;
import org.mm.FinanceTracker.Accounting.AmortizationSchedule;
import org.mm.FinanceTracker.Accounting.services.AccountingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/loans")
public class LoanController {

	@Autowired
	private AccountingService accountingService;

	@GetMapping("/")
	public ResponseEntity<List<Loan>> getAllLoans() {
		List<Loan> loans = accountingService.getAllLoans();
		return loans.isEmpty()
			? ResponseEntity.noContent().build()
			: ResponseEntity.ok(loans);
	}

	@GetMapping("/active")
	public ResponseEntity<List<Loan>> getActiveLoans() {
		List<Loan> loans = accountingService.getActiveLoans();
		return ResponseEntity.ok(loans);
	}

	@GetMapping("/{id}")
	public ResponseEntity<Loan> getLoanById(@PathVariable Long id) {
		Loan loan = accountingService.getLoanById(id);
		return loan != null
			? ResponseEntity.ok(loan)
			: ResponseEntity.notFound().build();
	}

	@PostMapping("/")
	public ResponseEntity<Loan> createLoan(@RequestBody Loan loan) {
		Loan saved = accountingService.createLoan(loan);
		return ResponseEntity.status(HttpStatus.CREATED).body(saved);
	}

	@PutMapping("/{id}")
	public ResponseEntity<Loan> updateLoan(
			@PathVariable Long id,
			@RequestBody Loan loanDetails) {

			Loan updated = accountingService.updateLoan(id, loanDetails);
			return ResponseEntity.ok(updated);
			}

	@PostMapping("/{id}/payment")
	public ResponseEntity<Loan> recordPayment(
			@PathVariable Long id,
			@RequestParam BigDecimal amount,
			@RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate paymentDate) {

			Loan updated = accountingService.recordLoanPayment(id, amount);
			return ResponseEntity.ok(updated);
			}

	@PostMapping("/{id}/refinance")
	public ResponseEntity<Loan> refinanceLoan(
			@PathVariable Long id,
			@RequestParam BigDecimal newInterestRate,
			@RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate newMaturityDate) {

			Loan refinanced = accountingService.refinanceLoan(id, newInterestRate, newMaturityDate);
			return ResponseEntity.ok(refinanced);
			}

	@GetMapping("/{id}/amortization-schedule")
	public ResponseEntity<List<org.mm.FinanceTracker.Accounting.AmortizationSchedule>>
	getAmortizationSchedule(@PathVariable Long id) {
		List<org.mm.FinanceTracker.Accounting.AmortizationSchedule> schedule =
			accountingService.getLoanAmortizationSchedule(id);
		return ResponseEntity.ok(schedule);
	}

	@GetMapping("/total-outstanding")
	public ResponseEntity<BigDecimal> getTotalOutstanding() {
		BigDecimal total = accountingService.getTotalLoanOutstanding();
		return ResponseEntity.ok(total);
	}

	@GetMapping("/upcoming-payments")
	public ResponseEntity<List<Loan>> getUpcomingPayments(
			@RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
			@RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate) {

			List<Loan> loans = accountingService.getLoansWithUpcomingPayments(fromDate, toDate);
			return ResponseEntity.ok(loans);
			}

	@GetMapping("/interest-expense/{periodId}")
	public ResponseEntity<BigDecimal> getInterestExpenseForPeriod(@PathVariable Integer periodId) {
		BigDecimal interest = accountingService.getLoanInterestExpenseForPeriod(periodId);
		return ResponseEntity.ok(interest);
	}
}
