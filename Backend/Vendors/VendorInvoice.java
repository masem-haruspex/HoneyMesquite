package org.mm.FinanceTracker.Vendors;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "vendor_invoices")
public class VendorInvoice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @ManyToOne
    @JoinColumn(name = "contract_id", nullable = false)
    private VendorContract contract;

    @Column(name = "invoice_date", nullable = false)
    private LocalDate invoiceDate;

    @Column(name = "amount", nullable = false, precision = 19, scale = 4)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status", nullable = false, length = 20)
    private PaymentStatus paymentStatus;

    @Column(name = "market_rate_at_payment", precision = 19, scale = 4)
    private BigDecimal marketRateAtPayment;

    // Getters and Setters
    public long getId() { return id; }
	public void setId(long id) { this.id = id; }
    public VendorContract getContract() { return contract; }
    public void setContract(VendorContract contract) { this.contract = contract; }
    public LocalDate getInvoiceDate() { return invoiceDate; }
    public void setInvoiceDate(LocalDate invoiceDate) { this.invoiceDate = invoiceDate; }
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    public PaymentStatus getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(PaymentStatus paymentStatus) { this.paymentStatus = paymentStatus; }
    public BigDecimal getMarketRateAtPayment() { return marketRateAtPayment; }
    public void setMarketRateAtPayment(BigDecimal marketRateAtPayment) { this.marketRateAtPayment = marketRateAtPayment; }

    // Constructors
    public VendorInvoice() {
        this.invoiceDate = LocalDate.now();
        this.paymentStatus = PaymentStatus.PENDING;
    }
    public  VendorInvoice(
    VendorContract contract,
    LocalDate invoiceDate,
    BigDecimal amount,
    PaymentStatus paymentStatus,
    BigDecimal marketRateAtPayment
    ){
        this.contract = contract;
        this.invoiceDate = invoiceDate;
        this.amount = amount;
        this.paymentStatus = paymentStatus;
        this.marketRateAtPayment = marketRateAtPayment;

    }
}
