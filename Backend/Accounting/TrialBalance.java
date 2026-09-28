package org.mm.FinanceTracker.Accounting;

import jakarta.persistence.*;
import org.hibernate.annotations.Immutable;
import java.math.BigDecimal;

@Entity
@Immutable
@Table(name = "trial_balance")
public class TrialBalance {
    
    @Id
    @Column(name = "code", length = 20)
    private String code;
    
    @Column(name = "name", length = 200)
    private String name;
    
    @Column(name = "type", length = 20)
    private String type;
    
    @Column(name = "total_debits", precision = 19, scale = 4)
    private BigDecimal totalDebits;
    
    @Column(name = "total_credits", precision = 19, scale = 4)
    private BigDecimal totalCredits;
    
    @Column(name = "balance", precision = 19, scale = 4)
    private BigDecimal balance;
    
    public TrialBalance() {}
    
    public TrialBalance(String code, String name, String type,
                       BigDecimal totalDebits, BigDecimal totalCredits,
                       BigDecimal balance) {
        this.code = code;
        this.name = name;
        this.type = type;
        this.totalDebits = totalDebits;
        this.totalCredits = totalCredits;
        this.balance = balance;
    }
    
    public String getCode() { return code; }
    public String getName() { return name; }
    public String getType() { return type; }
    public BigDecimal getTotalDebits() { return totalDebits; }
    public BigDecimal getTotalCredits() { return totalCredits; }
    public BigDecimal getBalance() { return balance; }
    
}
