package org.mm.FinanceTracker.Vendors;

import org.mm.FinanceTracker.Vendors.VendorInvoice;
import org.mm.FinanceTracker.Vendors.VendorInvoiceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/vendor-invoices")
public class VendorInvoiceController {

    @Autowired
    private VendorInvoiceRepository vendorInvoiceRepository;

    @GetMapping("/")
    public ResponseEntity<List<VendorInvoice>> getAllInvoices() {
        List<VendorInvoice> invoices = new ArrayList<>();
        vendorInvoiceRepository.findAll().forEach(invoices::add);
        return invoices.isEmpty()
            ? new ResponseEntity<>(HttpStatus.NO_CONTENT)
            : new ResponseEntity<>(invoices, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<VendorInvoice> getInvoiceById(@PathVariable Long id) {
        Optional<VendorInvoice> invoice = vendorInvoiceRepository.findById(id);
        return invoice.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
            .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @PostMapping("/")
    public ResponseEntity<VendorInvoice> createInvoice(@Valid @RequestBody VendorInvoiceRequest request) {
        VendorInvoice invoice = new VendorInvoice();
        
        VendorInvoice savedInvoice = vendorInvoiceRepository.save(invoice);
        return new ResponseEntity<>(savedInvoice, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<VendorInvoice> updateInvoice(@PathVariable Long id, @Valid @RequestBody VendorInvoiceRequest request) {
        Optional<VendorInvoice> existingInvoiceOpt = vendorInvoiceRepository.findById(id);
        
        if (existingInvoiceOpt.isPresent()) {
            VendorInvoice existingInvoice = existingInvoiceOpt.get();
            
            VendorInvoice updatedInvoice = vendorInvoiceRepository.save(existingInvoice);
            return new ResponseEntity<>(updatedInvoice, HttpStatus.OK);
        } else {
            VendorInvoice invoice = new VendorInvoice();
            invoice.setId(id);
            
            VendorInvoice savedInvoice = vendorInvoiceRepository.save(invoice);
            return new ResponseEntity<>(savedInvoice, HttpStatus.CREATED);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<HttpStatus> deleteInvoice(@PathVariable Long id) {
        try {
            vendorInvoiceRepository.deleteById(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
