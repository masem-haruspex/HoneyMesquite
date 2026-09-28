package org.mm.FinanceTracker.Receivables;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "clients")
public class Client {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private long id;

	@Column(name = "name", nullable = false, length = 255)
	private String name;

	@Column(name = "credit_rating", length = 2)
	private String creditRating;

	@Column(name = "payment_terms", nullable = false)
	private int paymentTerms;

	@Column(name = "last_payment_date")
	private LocalDateTime lastPaymentDate;

	@Column(name = "created_at")
	private LocalDateTime createdAt;

	@Column(name = "updated_at")
	private LocalDateTime updatedAt;

	// Getters and Setters
	public long getId() { return id; }
	public String getName() { return name; }
	public void setName(String name) { this.name = name; }
	public String getCreditRating() { return creditRating; }
	public void setCreditRating(String creditRating) { this.creditRating = creditRating; }
	public int getPaymentTerms() { return paymentTerms; }
	public void setPaymentTerms(int paymentTerms) { this.paymentTerms = paymentTerms; }
	public LocalDateTime getLastPaymentDate() { return lastPaymentDate; }
	public void setLastPaymentDate(LocalDateTime lastPaymentDate) { this.lastPaymentDate = lastPaymentDate; }
	public LocalDateTime getCreatedAt() { return createdAt; }
	public void setCreatedAt(LocalDateTime t) { this.createdAt = t; }
	public LocalDateTime getUpdatedAt() { return updatedAt; }
	public void setUpdatedAt(LocalDateTime t) { this.updatedAt = t; }

	// Constructors
	public Client() {
		this.paymentTerms = 30;
	}
}
