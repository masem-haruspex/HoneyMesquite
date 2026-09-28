package org.mm.FinanceTracker.Receivables;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "accounts_receivable")
public class AccountsReceivable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @ManyToOne
    @JoinColumn(name = "client_id", nullable = false)
    private Client client;

    @Column(name = "invoice_number", nullable = false, unique = true, length = 50)
    private String invoiceNumber;

    @Column(name = "amount", nullable = false, precision = 19, scale = 4)
    private BigDecimal amount;

    @Column(name = "issued_date", nullable = false)
    private LocalDate issuedDate;

    @Column(name = "due_date", insertable = false, updatable = false)
    private LocalDate dueDate;

    @Column(name = "days_late", insertable = false, updatable = false)
    private Integer daysLate;

    @Column(name = "status", insertable = false, updatable = false, length = 20)
    private String status;

    @Enumerated(EnumType.STRING)
    @Column(name = "collection_stage", nullable = false, length = 20)
    private CollectionStage collectionStage;

    @Column(name = "probability_of_payment", precision = 5, scale = 2)
    private BigDecimal probabilityOfPayment;

    @Column(name = "last_reminder_date")
    private LocalDateTime lastReminderDate;

    // Getters and Setters
    public long getId() { return id; }
    public Client getClient() { return client; }
    public void setClient(Client client) { this.client = client; }
    public String getInvoiceNumber() { return invoiceNumber; }
    public void setInvoiceNumber(String invoiceNumber) { this.invoiceNumber = invoiceNumber; }
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    public LocalDate getIssuedDate() { return issuedDate; }
    public void setIssuedDate(LocalDate issuedDate) { this.issuedDate = issuedDate; }
    public LocalDate getDueDate() { return dueDate; }
	public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }
    public Integer getDaysLate() { return daysLate; }
    public String getStatus() { return status; }
    public CollectionStage getCollectionStage() { return collectionStage; }
    public void setCollectionStage(CollectionStage collectionStage) { this.collectionStage = collectionStage; }
    public BigDecimal getProbabilityOfPayment() { return probabilityOfPayment; }
    public void setProbabilityOfPayment(BigDecimal probabilityOfPayment) { this.probabilityOfPayment = probabilityOfPayment; }
    public LocalDateTime getLastReminderDate() { return lastReminderDate; }
    public void setLastReminderDate(LocalDateTime lastReminderDate) { this.lastReminderDate = lastReminderDate; }

    // Constructors
    public AccountsReceivable() {
        this.collectionStage = CollectionStage.PENDING;
    }
    public AccountsReceivable(
    Client client,
    String invoiceNumber,
    BigDecimal amount,
    LocalDate issuedDate,
    LocalDate dueDate,
    Integer daysLate,
    String status,
    CollectionStage collectionStage,
    BigDecimal probabilityOfPayment,
    LocalDateTime lastReminderDate
    ){
        this.client = client;
        this.invoiceNumber = invoiceNumber;
        this.amount = amount;
        this.issuedDate = issuedDate;
        this.dueDate = dueDate;
        this.daysLate = daysLate;
        this.status = status;
        this.collectionStage = collectionStage;
        this.probabilityOfPayment = probabilityOfPayment;
        this.lastReminderDate = lastReminderDate;
    }
}
