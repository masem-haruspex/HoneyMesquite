package org.mm.FinanceTracker.CashFlow.models;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import org.hibernate.annotations.Generated;
import org.hibernate.annotations.GenerationTime;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "liquidity_events")
public class LiquidityEvent {
	@Id
	@Column(name = "event_date", nullable = false)
	private LocalDate date;

	@Column(name = "cash_in", nullable = false, precision = 19, scale = 4)
	private BigDecimal cashIn;

	@Column(name = "cash_out", nullable = false, precision = 19, scale = 4)
	private BigDecimal cashOut;

	@Generated(GenerationTime.ALWAYS)
	@Column(name = "net_flow", insertable = false, updatable = false,
			columnDefinition = "NUMERIC(19,4) GENERATED ALWAYS AS (cash_in - cash_out) STORED")
	private BigDecimal netFlow;

	@Column(name = "balance", nullable = false, precision = 19, scale = 4)
	private BigDecimal balance;

	@OneToMany(mappedBy = "liquidityEvent", cascade = CascadeType.ALL, orphanRemoval = true)
	@JsonManagedReference
	private List<CriticalAccount> criticalAccounts = new ArrayList<>();

	// Getters and Setters
	public LocalDate getDate() {
		return date;
	}

	public void setDate(LocalDate date) {
		this.date = date;
	}

	public BigDecimal getCashIn() {
		return cashIn;
	}

	public void setCashIn(BigDecimal cashIn) {
		this.cashIn = cashIn;
	}

	public BigDecimal getCashOut() {
		return cashOut;
	}

	public void setCashOut(BigDecimal cashOut) {
		this.cashOut = cashOut;
	}

	public BigDecimal getNetFlow() {
		return netFlow;
	}

	public void setNetFlow(BigDecimal netFlow) {
		this.netFlow = netFlow;
	}

	public BigDecimal getBalance() {
		return balance;
	}

	public void setBalance(BigDecimal balance) {
		this.balance = balance;
	}

	public List<CriticalAccount> getCriticalAccounts() {
		return criticalAccounts;
	}

	public void setCriticalAccounts(List<CriticalAccount> criticalAccounts) {
		this.criticalAccounts = criticalAccounts;
	}

	public LiquidityEvent() {}

	public LiquidityEvent(LocalDate date, BigDecimal cashIn, BigDecimal cashOut, BigDecimal balance) {
		this.date = date;
		this.cashIn = cashIn;
		this.cashOut = cashOut;
		this.balance = balance;
	}

	public void addCriticalAccount(CriticalAccount account) {
		criticalAccounts.add(account);
		account.setLiquidityEvent(this);
	}

	public void removeCriticalAccount(CriticalAccount account) {
		criticalAccounts.remove(account);
		account.setLiquidityEvent(null);
	}
}