package org.mm.FinanceTracker.Budget;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("api/budget")
public class BudgetController {
	private static final Logger logger = LoggerFactory.getLogger(BudgetController.class);

	@Autowired
	BudgetAllocationRepository allocationRepository;

	@Autowired
	BudgetActualRepository actualRepository;

	@GetMapping("/allocations/")
	public ResponseEntity<List<BudgetAllocation>> getAllAllocations() {
		logger.debug("Entering getAllAllocations()");
		try {
			List<BudgetAllocation> result = new ArrayList<>();
			allocationRepository.findAll().forEach(result::add);

			logger.debug("Found {} allocations", result.size());
			if (result.isEmpty()) {
				logger.info("No allocations found");
				return new ResponseEntity<>(HttpStatus.NO_CONTENT);
			}

			logger.debug("Returning {} allocations", result.size());
			return new ResponseEntity<>(result, HttpStatus.OK);
		} catch (Exception e) {
			logger.error("Error in getAllAllocations: {}", e.getMessage(), e);
			throw e;
		}
	}

	@PostMapping("/allocations/")
	@Transactional
	public ResponseEntity<BudgetAllocation> createAllocation(
			@RequestBody BudgetAllocationRequest request) {

		logger.debug("Entering createAllocation() with request: {}", request);
		try {
			BudgetAllocation allocation = new BudgetAllocation(
					request.department(),
					request.category(),
					request.fiscalYear(),
					request.quarter(),
					request.budgetedAmount(),
					request.isCurrent(),
					request.version(),
					LocalDateTime.now()
			);

			logger.debug("Created new allocation: {}", allocation);

			if (allocation.getIsCurrent()) {
				logger.debug("Unsetting current allocations for department {}, category {}, FY {}, quarter {}",
						allocation.getDepartment().getId(),
						allocation.getCategory().getId(),
						allocation.getFiscalYear(),
						allocation.getQuarter());

				allocationRepository.unsetCurrentAllocations(
						allocation.getDepartment().getId(),
						allocation.getCategory().getId(),
						allocation.getFiscalYear(),
						allocation.getQuarter()
				);
			}

			BudgetAllocation saved = allocationRepository.save(allocation);
			logger.info("Successfully created allocation with ID: {}", saved.getId());

			return new ResponseEntity<>(saved, HttpStatus.CREATED);
		} catch (Exception e) {
			logger.error("Error creating allocation: {}", e.getMessage(), e);
			throw e;
		}
	}

	@PutMapping("/allocations/{id}")
	@Transactional
	public ResponseEntity<BudgetAllocation> updateAllocation(
			@PathVariable Long id,
			@RequestBody BudgetAllocationRequest request) {

		logger.debug("Entering updateAllocation() for ID {} with request: {}", id, request);
		try {
			BudgetAllocation existing = allocationRepository.findById(id)
					.orElseThrow(() -> {
						logger.error("Allocation not found with ID: {}", id);
						return new RuntimeException("Allocation not found");
					});

			logger.debug("Found existing allocation: {}", existing);

			if (request.isCurrent() && !existing.getIsCurrent()) {
				logger.debug("Unsetting current allocations for department {}, category {}, FY {}, quarter {}",
						existing.getDepartment().getId(),
						existing.getCategory().getId(),
						existing.getFiscalYear(),
						existing.getQuarter());

				allocationRepository.unsetCurrentAllocations(
						existing.getDepartment().getId(),
						existing.getCategory().getId(),
						existing.getFiscalYear(),
						existing.getQuarter()
				);
			}

			existing.setBudgetedAmount(request.budgetedAmount());
			existing.setIsCurrent(request.isCurrent());
			existing.setVersion(existing.getVersion() + 1);
			existing.setQuarter(request.quarter());

			BudgetAllocation updated = allocationRepository.save(existing);
			logger.info("Successfully updated allocation with ID: {}", id);

			return new ResponseEntity<>(updated, HttpStatus.OK);
		} catch (Exception e) {
			logger.error("Error updating allocation ID {}: {}", id, e.getMessage(), e);
			throw e;
		}
	}

	@PostMapping("/actuals/")
	@Transactional
	public ResponseEntity<BudgetActual> createActual(
			@RequestBody BudgetActualRequest request) {

		logger.debug("Entering createActual() with request: {}", request);
		try {
			BudgetAllocation allocation = allocationRepository.findById(request.allocationId())
					.orElseThrow(() -> {
						logger.error("Allocation not found with ID: {}", request.allocationId());
						return new RuntimeException("Allocation not found");
					});

			logger.debug("Found associated allocation: {}", allocation);

			BudgetActual actual = new BudgetActual(
					allocation,
					request.recordedDate(),
					request.actualAmount(),
					request.notes()
			);

			BudgetActual saved = actualRepository.save(actual);
			logger.info("Successfully created actual with ID: {}", saved.getId());

			return new ResponseEntity<>(saved, HttpStatus.CREATED);
		} catch (Exception e) {
			logger.error("Error creating actual: {}", e.getMessage(), e);
			throw e;
		}
	}

	@GetMapping("/monthly-breakdown")
	public ResponseEntity<List<BudgetMonthlyBreakdownResponse>> getMonthlyBreakdown(
			@RequestParam Long departmentId,
			@RequestParam int fiscalYear,
			@RequestParam Quarter quarter) {

		logger.debug("Entering getMonthlyBreakdown() for department {}, FY {}, quarter {}",
				departmentId, fiscalYear, quarter);
		try {
			List<BudgetMonthlyBreakdownResponse> response = allocationRepository
					.findByDepartmentIdAndFiscalYearAndQuarter(departmentId, fiscalYear, quarter)
					.stream()
					.map(allocation -> {
						logger.debug("Processing allocation ID: {}", allocation.getId());
						Map<String, BigDecimal> breakdown = calculateMonthlyBreakdown(allocation);
						return new BudgetMonthlyBreakdownResponse(
								allocation.getId(),
								allocation.getDepartment().getId(),
								allocation.getCategory().getId(),
								allocation.getFiscalYear(),
								allocation.getQuarter(),
								allocation.getBudgetedAmount(),
								allocation.getCategory().getName(),
								breakdown
						);
					})
					.toList();

			logger.info("Returning monthly breakdown with {} records", response.size());
			return new ResponseEntity<>(response, HttpStatus.OK);
		} catch (Exception e) {
			logger.error("Error in getMonthlyBreakdown: {}", e.getMessage(), e);
			throw e;
		}
	}

	@GetMapping("/vs-actual")
	public ResponseEntity<List<BudgetVsActualResponse>> getBudgetVsActual(
			@RequestParam(required = false) Long departmentId,
			@RequestParam(defaultValue = "2025") int fiscalYear) {

		logger.debug("Entering getBudgetVsActual() for department {}, FY {}", departmentId, fiscalYear);
		try {
			List<BudgetVsActualResponse> response = allocationRepository
					.findByDepartmentIdAndFiscalYear(departmentId, fiscalYear)
					.stream()
					.map(allocation -> {
						logger.debug("Processing allocation ID: {}", allocation.getId());
						BigDecimal actualAmount = actualRepository.findByAllocationId(allocation.getId())
								.stream()
								.map(BudgetActual::getActualAmount)
								.reduce(BigDecimal.ZERO, BigDecimal::add);

						BigDecimal variance = allocation.getBudgetedAmount().subtract(actualAmount);
						logger.debug("Allocation ID {} - Budget: {}, Actual: {}, Variance: {}",
								allocation.getId(), allocation.getBudgetedAmount(), actualAmount, variance);

						return new BudgetVsActualResponse(
								allocation.getId(),
								allocation.getCategory().getId(),
								allocation.getCategory().getName(),
								allocation.getBudgetedAmount(),
								actualAmount,
								variance,
								allocation.getQuarter(),
                                allocation.getFiscalYear()
						);
					})
					.toList();

			logger.info("Returning budget vs actual with {} records", response.size());
			return new ResponseEntity<>(response, HttpStatus.OK);
		} catch (Exception e) {
			logger.error("Error in getBudgetVsActual: {}", e.getMessage(), e);
			throw e;
		}
	}

	private Map<String, BigDecimal> calculateMonthlyBreakdown(BudgetAllocation allocation) {
		logger.debug("Calculating monthly breakdown for allocation ID: {}", allocation.getId());
		return Map.of(
				"Month1", allocation.getBudgetedAmount().divide(BigDecimal.valueOf(3))
		);
	}
}
