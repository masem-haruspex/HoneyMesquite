package org.mm.FinanceTracker.Vendors;

import org.mm.FinanceTracker.Vendors.VendorInvoice;
import org.mm.FinanceTracker.Vendors.VendorInvoiceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class VendorInvoiceService {

    @Autowired
    private VendorInvoiceRepository vendorInvoiceRepository;

    public List<VendorInvoice> getAllInvoices() {
        return vendorInvoiceRepository.findAll();
    }

    public Optional<VendorInvoice> getInvoiceById(Long id) {
        return vendorInvoiceRepository.findById(id);
    }

    @Transactional
    public VendorInvoice createInvoice(VendorInvoice invoice) {
        return vendorInvoiceRepository.save(invoice);
    }

    @Transactional
    public VendorInvoice updateInvoice(Long id, VendorInvoice invoiceDetails) {
        VendorInvoice invoice = vendorInvoiceRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Vendor Invoice not found with id: " + id));
        
        invoice.setContract(invoiceDetails.getContract());
        invoice.setInvoiceDate(invoiceDetails.getInvoiceDate());
        invoice.setAmount(invoiceDetails.getAmount());
        invoice.setPaymentStatus(invoiceDetails.getPaymentStatus());
        invoice.setMarketRateAtPayment(invoiceDetails.getMarketRateAtPayment());
        
        return vendorInvoiceRepository.save(invoice);
    }

    @Transactional
    public void deleteInvoice(Long id) {
        VendorInvoice invoice = vendorInvoiceRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Vendor Invoice not found with id: " + id));
        vendorInvoiceRepository.delete(invoice);
    }
}
