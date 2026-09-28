package org.mm.FinanceTracker.CashFlow.controllers;

import org.mm.FinanceTracker.CashFlow.models.RunwayDataView;
import org.mm.FinanceTracker.CashFlow.repositories.RunwayDataViewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/runway-data-view")
public class RunwayDataViewController {

	@Autowired
	private RunwayDataViewRepository runwayDataViewRepository;

	@GetMapping("/")
	public ResponseEntity<List<RunwayDataView>> getAllRunwayData() {
		List<RunwayDataView> data = runwayDataViewRepository.findAllOrderedByDate();
		return data.isEmpty()
			? new ResponseEntity<>(HttpStatus.NO_CONTENT)
			: new ResponseEntity<>(data, HttpStatus.OK);
	}

	@GetMapping("/by-date-range")
	public ResponseEntity<List<RunwayDataView>> getByDateRange(
			@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
			@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

			List<RunwayDataView> data = runwayDataViewRepository.findByDateRange(startDate, endDate);
			return data.isEmpty()
				? new ResponseEntity<>(HttpStatus.NO_CONTENT)
				: new ResponseEntity<>(data, HttpStatus.OK);
			}

	@GetMapping("/status")
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
