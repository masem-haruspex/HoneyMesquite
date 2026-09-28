package org.mm.FinanceTracker.ProfitLoss;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface ProfitLossRepository extends JpaRepository<ProfitLossStatement, Long> {

    @Query("SELECT p FROM ProfitLossStatement p WHERE p.department.id = :departmentId")
    List<ProfitLossStatement> findByDepartmentId(Long departmentId);


	@Query("""
    SELECT DISTINCT p FROM ProfitLossStatement p
    LEFT JOIN FETCH p.lineItems li
    LEFT JOIN FETCH li.category
    """)
	List<ProfitLossStatement> findAllWithCategories();
}
