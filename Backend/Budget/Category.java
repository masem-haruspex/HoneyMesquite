package org.mm.FinanceTracker.Budget;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "categories")
public class Category {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private long id;

	@Column(name = "name", nullable = false, unique = true, length = 100)
	private String name;

	@Enumerated(EnumType.STRING)
	@Column(name = "type", nullable = false, length = 10)
	private CategoryType type;

	@JsonIgnoreProperties("category")
	@OneToMany(mappedBy = "category", cascade = CascadeType.ALL)
	private List<BudgetAllocation> allocations = new ArrayList<>();

	@Column(name = "created_at", nullable = false, columnDefinition = "TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP")
	private LocalDateTime createdAt;

	@Column(name = "account_code", length = 20)
	private String accountCode;

	public long getId() { return id; }
	public String getName() { return name; }
	public void setName(String name) { this.name = name; }
	public CategoryType getType() { return type; }
	public void setType(CategoryType type) { this.type = type; }
	public List<BudgetAllocation> getAllocations() { return allocations; }
	public void setAllocations(List<BudgetAllocation> allocations) { this.allocations = allocations; }
	public LocalDateTime getCreatedAt() { return createdAt; }
	public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
	public String getAccountCode() { return accountCode; }
	public void setAccountCode(String accountCode) { this.accountCode = accountCode; }

	public Category() {
		this.createdAt = LocalDateTime.now();
	}

	public Category(String name, CategoryType type, List<BudgetAllocation> allocations,
			LocalDateTime createdAt, String accountCode) {
		this.name = name;
		this.type = type;
		this.allocations = allocations;
		this.createdAt = createdAt;
		this.accountCode = accountCode;
	}
}
