package org.mm.FinanceTracker.Accounting;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AccountRepository extends JpaRepository<Account, String> {
    List<Account> findByType(String type);
    List<Account> findByIsActiveTrue();
    List<Account> findByParentCode(String parentCode);
    List<Account> findByParentCodeIsNull();
}
