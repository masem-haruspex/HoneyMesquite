package org.mm.FinanceTracker.ProfitLoss;

import jakarta.persistence.*;
import org.mm.FinanceTracker.Budget.Category;
import java.io.Serializable;
import java.math.BigDecimal;
import java.util.Objects;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "pl_line_items")
public class PLLineItem {

	@EmbeddedId
	private PLLineItemId id;

	@ManyToOne
	@MapsId("statementId")  
	@JoinColumn(name = "statement_id", nullable = false)
	@JsonIgnoreProperties("lineItems")
	private ProfitLossStatement statement;

	@ManyToOne
	@MapsId("categoryId")  
	@JoinColumn(name = "category_id", nullable = false)
	private Category category;

	@Column(name = "amount", nullable = false, precision = 19, scale = 4)
	private BigDecimal amount;

	@Column(name = "variance_from_budget", precision = 19, scale = 4)
	private BigDecimal varianceFromBudget;

	@Column(name = "notes", columnDefinition = "TEXT")
	private String notes;

	@Column(name = "account_code", length = 20)
	private String accountCode;


	public PLLineItemId getId() { return id; }
	public void setId(PLLineItemId id) { this.id = id; }
	public ProfitLossStatement getStatement() { return statement; }
	public void setStatement(ProfitLossStatement statement) { this.statement = statement; }
	public Category getCategory() { return category; }
	public void setCategory(Category category) { this.category = category; }
	public BigDecimal getAmount() { return amount; }
	public void setAmount(BigDecimal amount) { this.amount = amount; }
	public BigDecimal getVarianceFromBudget() { return varianceFromBudget; }
	public void setVarianceFromBudget(BigDecimal varianceFromBudget) { this.varianceFromBudget = varianceFromBudget; }
	public String getNotes() { return notes; }
	public void setNotes(String notes) { this.notes = notes; }
	public String getAccountCode() { return accountCode; }
	public void setAccountCode(String accountCode) { this.accountCode = accountCode; }

	public PLLineItem() {
		this.id = new PLLineItemId();
	}
}

