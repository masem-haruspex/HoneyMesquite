package org.mm.FinanceTracker.Departments;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

public interface DepartmentPerformanceRepository extends JpaRepository<DepartmentPerformance, Long> {
    @Transactional
    @Modifying
    @Query("UPDATE DepartmentPerformance dp SET dp.isCurrent = false WHERE dp.department.id = ?1 AND dp.id != ?2")
    void unsetCurrentFlags(Long departmentId, Long excludeId);

    Optional<DepartmentPerformance> findFirstByDepartmentIdAndIdNotOrderByRecordedDateDesc(long id, Long id1);
    List<DepartmentPerformance> findByDepartmentId(Long departmentId);
	List<DepartmentPerformance> findByIsCurrentTrue();
}
