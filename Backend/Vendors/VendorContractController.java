package org.mm.FinanceTracker.Vendors;

import org.mm.FinanceTracker.Accounting.JournalEntry;
import org.mm.FinanceTracker.Accounting.JournalEntryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("api/vendor-contracts")
public class VendorContractController {

    @Autowired
    VendorContractRepository contractRepository;

    @Autowired
    VendorInvoiceRepository vendorInvoiceRepository;

    @Autowired
    JournalEntryRepository journalEntryRepository;

    @GetMapping("/")
    public ResponseEntity<List<VendorContract>> getAllContracts() {
        List<VendorContract> result = new ArrayList<>();
        contractRepository.findAll().forEach(result::add);
        return result.isEmpty()
            ? new ResponseEntity<>(HttpStatus.NO_CONTENT)
            : new ResponseEntity<>(result, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<VendorContract> getContractById(@PathVariable Long id) {
        return contractRepository.findById(id)
            .map(contract -> new ResponseEntity<>(contract, HttpStatus.OK))
            .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @PostMapping("/")
    public ResponseEntity<VendorContract> createContract(@RequestBody VendorContract contract) {
        VendorContract savedContract = contractRepository.save(contract);
        return new ResponseEntity<>(savedContract, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<VendorContract> updateContract(@PathVariable Long id, @RequestBody VendorContract contractDetails) {
        return contractRepository.findById(id)
            .map(existing -> {
                existing.setVendor(contractDetails.getVendor());
                existing.setDepartment(contractDetails.getDepartment());
                existing.setServiceDescription(contractDetails.getServiceDescription());
                existing.setContractedRate(contractDetails.getContractedRate());
                existing.setMarketComparisonRate(contractDetails.getMarketComparisonRate());
                existing.setContractStart(contractDetails.getContractStart());
                existing.setContractEnd(contractDetails.getContractEnd());
                existing.setAutoRenew(contractDetails.getAutoRenew());
                existing.setPaymentTerms(contractDetails.getPaymentTerms());
                existing.setIsActive(contractDetails.getIsActive());
                
                VendorContract updated = contractRepository.save(existing);
                return new ResponseEntity<>(updated, HttpStatus.OK);
            })
            .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<HttpStatus> deleteContract(@PathVariable Long id) {
        try {
            contractRepository.deleteById(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/variance-analysis")
    public ResponseEntity<List<VendorContractVarianceResponse>> getVarianceAnalysis() {
        List<VendorContractVarianceResponse> result = new ArrayList<>();
        contractRepository.findAll().forEach(contract -> {
            BigDecimal marketRate = contract.getMarketComparisonRate() != null
                ? contract.getMarketComparisonRate()
                : BigDecimal.ZERO;
            BigDecimal variance = contract.getContractedRate().subtract(marketRate);
            double variancePercentage = marketRate.compareTo(BigDecimal.ZERO) != 0
                ? variance.divide(marketRate, 4, RoundingMode.HALF_UP).doubleValue() * 100
                : 0;
            result.add(new VendorContractVarianceResponse(
                contract.getId(),
                contract.getVendor().getId(),
                contract.getServiceDescription(),
                contract.getContractedRate(),
                marketRate,
                variance,
                variancePercentage
            ));
        });
        return new ResponseEntity<>(result, HttpStatus.OK);
	}
    

    @GetMapping("/expiring-soon")
    public ResponseEntity<List<VendorContractResponse>> getExpiringContracts(
            @RequestParam(defaultValue = "30") int daysThreshold) {
        LocalDate thresholdDate = LocalDate.now().plusDays(daysThreshold);
        List<VendorContractResponse> result = contractRepository
            .findByContractEndBetween(LocalDate.now(), thresholdDate)
            .stream()
            .map(contract -> new VendorContractResponse(
                contract.getId(),
                contract.getVendor().getId(),
                contract.getDepartment() != null ? contract.getDepartment().getId() : null,
                contract.getServiceDescription(),
                contract.getContractedRate(),
                contract.getMarketComparisonRate(),
                contract.getContractStart(),
                contract.getContractEnd(),
                contract.getAutoRenew()
            ))
            .toList();
        return new ResponseEntity<>(result, HttpStatus.OK);
    }

    @PostMapping("/{contractId}/invoices")
    @Transactional
    public ResponseEntity<VendorInvoiceResponse> createContractInvoice(
            @PathVariable Long contractId,
            @RequestBody VendorInvoiceRequest request) {
        VendorContract contract = contractRepository.findById(contractId)
            .orElseThrow(() -> new RuntimeException("Contract not found"));

        VendorInvoice invoice = new VendorInvoice(
            contract,
            request.invoiceDate(),
            request.amount(),
            request.paymentStatus(),
            request.marketRateAtPayment()
        );

        VendorInvoice saved = vendorInvoiceRepository.save(invoice);
        createJournalEntryForVendorInvoice(saved);

        return new ResponseEntity<>(
            new VendorInvoiceResponse(
                saved.getId(),
                contractId,
                saved.getInvoiceDate(),
                saved.getAmount(),
                saved.getPaymentStatus(),
                saved.getMarketRateAtPayment()
            ),
            HttpStatus.CREATED
        );
    }

    private void createJournalEntryForVendorInvoice(VendorInvoice invoice) {
        String ref = "VI-" + invoice.getId();

        // Debit Expense (6000)
        JournalEntry debit = new JournalEntry();
        debit.setDescription("Bill: Contract " + invoice.getContract().getId() + " - " +
            invoice.getContract().getServiceDescription());
        debit.setAccountCode("6000");
        debit.setDebitAmount(invoice.getAmount());
        debit.setAmount(invoice.getAmount());
        debit.setReferenceNumber(ref);
        debit.setPayableId(invoice.getId());

        // Credit Accounts Payable (2100)
        JournalEntry credit = new JournalEntry();
        credit.setDescription("Bill: Contract " + invoice.getContract().getId() + " - " +
            invoice.getContract().getServiceDescription());
        credit.setAccountCode("2100");
        credit.setCreditAmount(invoice.getAmount());
        credit.setAmount(invoice.getAmount());
        credit.setReferenceNumber(ref);
        credit.setPayableId(invoice.getId());

        journalEntryRepository.save(debit);
        journalEntryRepository.save(credit);
    }
}

record VendorContractVarianceResponse(
    Long contractId,
    Long vendorId,
    String serviceDescription,
    BigDecimal contractedRate,
    BigDecimal marketRate,
    BigDecimal varianceAmount,
    double variancePercentage
) {}
