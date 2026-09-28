package org.mm.FinanceTracker.Accounting;

import java.math.BigDecimal;
import java.time.LocalDate;

public class AmortizationSchedule {
    private Integer paymentNumber;
    private LocalDate paymentDate;
    private BigDecimal principalPayment;
    private BigDecimal interestPayment;
    private BigDecimal totalPayment;
    private BigDecimal remainingBalance;

    // Constructors
    public AmortizationSchedule() {}

    public AmortizationSchedule(Integer paymentNumber, LocalDate paymentDate,
                                BigDecimal principalPayment, BigDecimal interestPayment,
                                BigDecimal totalPayment, BigDecimal remainingBalance) {
        this.paymentNumber = paymentNumber;
        this.paymentDate = paymentDate;
        this.principalPayment = principalPayment;
        this.interestPayment = interestPayment;
        this.totalPayment = totalPayment;
        this.remainingBalance = remainingBalance;
    }

    // Getters and Setters
    public Integer getPaymentNumber() {
        return paymentNumber;
    }

    public void setPaymentNumber(Integer paymentNumber) {
        this.paymentNumber = paymentNumber;
    }

    public LocalDate getPaymentDate() {
        return paymentDate;
    }

    public void setPaymentDate(LocalDate paymentDate) {
        this.paymentDate = paymentDate;
    }

    public BigDecimal getPrincipalPayment() {
        return principalPayment;
    }

    public void setPrincipalPayment(BigDecimal principalPayment) {
        this.principalPayment = principalPayment;
    }

    public BigDecimal getInterestPayment() {
        return interestPayment;
    }

    public void setInterestPayment(BigDecimal interestPayment) {
        this.interestPayment = interestPayment;
    }

    public BigDecimal getTotalPayment() {
        return totalPayment;
    }

    public void setTotalPayment(BigDecimal totalPayment) {
        this.totalPayment = totalPayment;
    }

    public BigDecimal getRemainingBalance() {
        return remainingBalance;
    }

    public void setRemainingBalance(BigDecimal remainingBalance) {
        this.remainingBalance = remainingBalance;
    }
}
