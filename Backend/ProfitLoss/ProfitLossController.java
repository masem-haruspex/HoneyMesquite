package org.mm.FinanceTracker.ProfitLoss;

import com.fasterxml.jackson.core.JsonProcessingException;
import org.mm.FinanceTracker.Departments.DepartmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("api/profitloss")
public class ProfitLossController {

	@Autowired
	ProfitLossRepository repository;

	@Autowired
	DepartmentRepository departmentRepository;

	@GetMapping("/")
	public ResponseEntity<List<ProfitLossResponse>> getAll() throws JsonProcessingException {
		List<ProfitLossStatement> statements = repository.findAllWithCategories(); 

		List<ProfitLossResponse> result = statements.stream().map(item ->
				new ProfitLossResponse(
					item.getId(),
					item.getDepartment() != null ? item.getDepartment().getId() : null,
					item.getPeriodName(),
					item.getPeriodStart(),
					item.getPeriodEnd(),
					item.getRevenue(),
					item.getCogs(),
					item.getGrossProfit(),
					item.getOperatingExpenses(),
					item.getNetIncome(),
					item.getMarginPercentage(),
					item.isForecast(),
					item.getVersion(),
					item.getCreatedAt(),
					item.getLineItems()
					)
				).collect(java.util.stream.Collectors.toList());

		return result.isEmpty()
			? new ResponseEntity<>(HttpStatus.NO_CONTENT)
			: new ResponseEntity<>(result, HttpStatus.OK);
	}

	@PostMapping("/")
	public ResponseEntity<ProfitLossResponse> create(@RequestBody ProfitLossRequest input) {
		ProfitLossStatement result = repository.save(
				new ProfitLossStatement(
					departmentRepository.findById(input.departmentId()).orElse(null),
					input.periodName(),
					input.periodStart(),
					input.periodEnd(),
					input.revenue(),
					input.cogs(),
					input.grossProfit(),
					input.operatingExpenses(),
					input.netIncome(),
					input.marginPercentage(),
					input.isForecast(),
					input.version(),
					input.lineItems()
					));
		result.setDepartment(departmentRepository.findById(input.departmentId()).orElse(null));
		result.setPeriodName(input.periodName());
		result.setPeriodStart(input.periodStart());
		result.setPeriodEnd(input.periodEnd());
		result.setRevenue(input.revenue());
		result.setCogs(input.cogs());
		result.setGrossProfit(input.grossProfit());
		result.setOperatingExpenses(input.operatingExpenses());
		result.setNetIncome(input.netIncome());
		result.setMarginPercentage(input.marginPercentage());
		result.setIsForecast(input.isForecast());
		result.setVersion(input.version());
		result.setLineItems(input.lineItems());
		repository.save(result);

		return new ResponseEntity<>(
				new ProfitLossResponse(
					result.getId(),
					result.getDepartment() != null ? result.getDepartment().getId() : null,
					result.getPeriodName(),
					result.getPeriodStart(),
					result.getPeriodEnd(),
					result.getRevenue(),
					result.getCogs(),
					result.getGrossProfit(),
					result.getOperatingExpenses(),
					result.getNetIncome(),
					result.getMarginPercentage(),
					result.isForecast(),
					result.getVersion(),
					result.getCreatedAt(),
					result.getLineItems()
					), HttpStatus.CREATED);
	}

	@GetMapping("/department/{id}")
	public ResponseEntity<List<ProfitLossResponse>> findByDepartment(@PathVariable long id) {
		List<ProfitLossResponse> result = new ArrayList<>();
		repository.findByDepartmentId(id).forEach(item -> result.add(
					new ProfitLossResponse(
						item.getId(),
						item.getDepartment() != null ? item.getDepartment().getId() : null,
						item.getPeriodName(),
						item.getPeriodStart(),
						item.getPeriodEnd(),
						item.getRevenue(),
						item.getCogs(),
						item.getGrossProfit(),
						item.getOperatingExpenses(),
						item.getNetIncome(),
						item.getMarginPercentage(),
						item.isForecast(),
						item.getVersion(),
						item.getCreatedAt(),
						item.getLineItems()
						)));

		if (result.isEmpty())
			return new ResponseEntity<>(HttpStatus.NO_CONTENT);
		return new ResponseEntity<>(result, HttpStatus.OK);
	}

	@PutMapping("/{id}")
	public ResponseEntity<ProfitLossResponse> update(@PathVariable long id, @RequestBody ProfitLossRequest input) {
		return repository.findById(id)
			.map(existing -> {
				existing.setDepartment(departmentRepository.findById(input.departmentId()).orElse(null));
				existing.setPeriodName(input.periodName());
				existing.setPeriodStart(input.periodStart());
				existing.setPeriodEnd(input.periodEnd());
				existing.setRevenue(input.revenue());
				existing.setCogs(input.cogs());
				existing.setGrossProfit(input.grossProfit());
				existing.setOperatingExpenses(input.operatingExpenses());
				existing.setNetIncome(input.netIncome());
				existing.setMarginPercentage(input.marginPercentage());
				existing.setIsForecast(input.isForecast());
				existing.setVersion(input.version());
				existing.setLineItems(input.lineItems());

				ProfitLossStatement updated = repository.save(existing);

				return new ResponseEntity<>(
						new ProfitLossResponse(
							updated.getId(),
							updated.getDepartment() != null ? updated.getDepartment().getId() : null,
							updated.getPeriodName(),
							updated.getPeriodStart(),
							updated.getPeriodEnd(),
							updated.getRevenue(),
							updated.getCogs(),
							updated.getGrossProfit(),
							updated.getOperatingExpenses(),
							updated.getNetIncome(),
							updated.getMarginPercentage(),
							updated.isForecast(),
							updated.getVersion(),
							updated.getCreatedAt(),
							updated.getLineItems()
							), HttpStatus.OK);
			})
		.orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<HttpStatus> delete(@PathVariable long id) {
		if (!repository.existsById(id)) {
			return new ResponseEntity<>(HttpStatus.NOT_FOUND);
		}
		repository.deleteById(id);
		return new ResponseEntity<>(HttpStatus.NO_CONTENT);
	}
}
