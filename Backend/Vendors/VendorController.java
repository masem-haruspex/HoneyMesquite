package org.mm.FinanceTracker.Vendors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("api/vendors")
public class VendorController {

	@Autowired
	VendorRepository repository;

    @Autowired
    private PayablesAgingRepository payablesAgingRepository;

	@Autowired
	private JdbcTemplate jdbcTemplate;

	    @GetMapping("/payables/aging")
    public ResponseEntity<List<PayablesAgingResponse>> getPayablesAging() {
        List<PayablesAging> viewData = payablesAgingRepository.findAllOrderedByDaysOutstanding();

        List<PayablesAgingResponse> result = viewData.stream()
            .map(item -> new PayablesAgingResponse(
                item.getInvoiceId(),
                item.getVendorId(),
                item.getVendorName(),
                item.getContractId(),
                item.getInvoiceDate(),
                item.getAmount(),
                PaymentStatus.valueOf(item.getPaymentStatus()),
                item.getDaysOutstanding(),
                item.getAgingBucket()
            ))
            .toList();

        return result.isEmpty()
            ? new ResponseEntity<>(HttpStatus.NO_CONTENT)
            : new ResponseEntity<>(result, HttpStatus.OK);
    }

	@GetMapping("/")
	public ResponseEntity<List<VendorResponse>> getAll() {
		List<VendorResponse> result = new ArrayList<>();
		repository.findAll().forEach(item -> result.add(
					new VendorResponse(
						item.getId(),
						item.getLegalName(),
						item.getIndustryClassification(),
						item.getMarketRateReference()
						)));

		if (result.isEmpty())
			return new ResponseEntity<>(HttpStatus.NO_CONTENT);
		return new ResponseEntity<>(result, HttpStatus.OK);
	}

	@GetMapping("/{id}")
	public ResponseEntity<VendorResponse> findById(@PathVariable long id) {
		Vendor found = repository.findById(id).orElse(null);
		VendorResponse result = null;
		if(found != null)
			result = new VendorResponse(
					found.getId(),
					found.getLegalName(),
					found.getIndustryClassification(),
					found.getMarketRateReference()
					);

		if(result != null)
			return new ResponseEntity<>(result, HttpStatus.OK);
		else
			return new ResponseEntity<>(result, HttpStatus.NOT_FOUND);
	}

	@PostMapping("/")
	public ResponseEntity<VendorResponse> create(@RequestBody VendorRequest input) {
		Vendor result = repository.save(
				new Vendor(
					input.legalName(),
					input.industryClassification(),
					input.marketRateReference()
					));
		return new ResponseEntity<>(
				new VendorResponse(
					result.getId(),
					result.getLegalName(),
					result.getIndustryClassification(),
					result.getMarketRateReference()
					), HttpStatus.CREATED);
	}

	@PutMapping("/{id}")
	public ResponseEntity<VendorResponse> update(@PathVariable long id, @RequestBody VendorRequest input) {
		Vendor existing = repository.findById(id).orElse(null);
		if (existing != null) {
			existing.setLegalName(input.legalName());
			existing.setIndustryClassification(input.industryClassification());
			existing.setMarketRateReference(input.marketRateReference());
			repository.save(existing);
			return new ResponseEntity<>(
					new VendorResponse(
						existing.getId(),
						existing.getLegalName(),
						existing.getIndustryClassification(),
						existing.getMarketRateReference()
						), HttpStatus.OK);
		} else {
			return create(input);
		}
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<HttpStatus> delete(@PathVariable long id) {
		repository.deleteById(id);
		return new ResponseEntity<>(HttpStatus.NO_CONTENT);
	}
}
