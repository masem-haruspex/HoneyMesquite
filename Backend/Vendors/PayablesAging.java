package org.mm.FinanceTracker.Vendors;

import jakarta.persistence.*;
import org.hibernate.annotations.Immutable;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Immutable
@Table(name = "payables_aging")
public class PayablesAging {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "invoice_id")
    private Long invoiceId;
    
    @Column(name = "vendor_id")
    private Long vendorId;
    
    @Column(name = "vendor_name", length = 255)
    private String vendorName;
    
    @Column(name = "contract_id")
    private Long contractId;
    
    @Column(name = "invoice_date")
    private LocalDate invoiceDate;
    
    @Column(name = "amount", precision = 19, scale = 4)
    private BigDecimal amount;
    
    @Column(name = "payment_status", length = 20)
    private String paymentStatus;
    
    @Column(name = "days_outstanding")
    private Integer daysOutstanding;
    
    @Column(name = "aging_bucket", length = 10)
    private String agingBucket;
    
    public PayablesAging() {}
    
    public PayablesAging(Long invoiceId, Long vendorId, String vendorName,
                        Long contractId, LocalDate invoiceDate, BigDecimal amount,
                        String paymentStatus, Integer daysOutstanding, String agingBucket) {
        this.invoiceId = invoiceId;
        this.vendorId = vendorId;
        this.vendorName = vendorName;
        this.contractId = contractId;
        this.invoiceDate = invoiceDate;
        this.amount = amount;
        this.paymentStatus = paymentStatus;
        this.daysOutstanding = daysOutstanding;
        this.agingBucket = agingBucket;
    }
    
    public Long getId() { return id; }
    public Long getInvoiceId() { return invoiceId; }
    public Long getVendorId() { return vendorId; }
    public String getVendorName() { return vendorName; }
    public Long getContractId() { return contractId; }
    public LocalDate getInvoiceDate() { return invoiceDate; }
    public BigDecimal getAmount() { return amount; }
    public String getPaymentStatus() { return paymentStatus; }
    public Integer getDaysOutstanding() { return daysOutstanding; }
    public String getAgingBucket() { return agingBucket; }
    
}
