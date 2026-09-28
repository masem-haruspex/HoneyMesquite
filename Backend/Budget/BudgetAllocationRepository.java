package org.mm.FinanceTracker.Budget;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface BudgetAllocationRepository extends JpaRepository<BudgetAllocation, Long> {

    @Query("SELECT ba FROM BudgetAllocation ba WHERE ba.department.id = :departmentId " +
            "AND ba.fiscalYear = :fiscalYear AND ba.quarter = :quarter")
    List<BudgetAllocation> findByDepartmentAndPeriod(
            @Param("departmentId") Long departmentId,
            @Param("fiscalYear") int fiscalYear,
            @Param("quarter") Quarter quarter);

    @Query("SELECT ba FROM BudgetAllocation ba WHERE ba.department.id = :departmentId " +
            "AND ba.fiscalYear = :fiscalYear AND ba.quarter = :quarter")
    List<BudgetAllocation> findByDepartmentFiscalYearAndQuarter(
            @Param("departmentId") Long departmentId,
            @Param("fiscalYear") int fiscalYear,
            @Param("quarter") Quarter quarter);

    @Query("SELECT ba FROM BudgetAllocation ba WHERE ba.isCurrent = true " +
            "AND ba.department.id = :departmentId AND ba.category.id = :categoryId")
    List<BudgetAllocation> findCurrentByDepartmentAndCategory(
            @Param("departmentId") Long departmentId,
            @Param("categoryId") Long categoryId);

    @Modifying
    @Transactional
    @Query("UPDATE BudgetAllocation ba SET ba.isCurrent = false " +
            "WHERE ba.department.id = :departmentId " +
            "AND ba.category.id = :categoryId " +
            "AND ba.fiscalYear = :fiscalYear " +
            "AND ba.quarter = :quarter")
    void unsetCurrentAllocations(
            @Param("departmentId") Long departmentId,
            @Param("categoryId") Long categoryId,
            @Param("fiscalYear") int fiscalYear,
            @Param("quarter") Quarter quarter);

    @Query("SELECT ba FROM BudgetAllocation ba WHERE ba.isCurrent = true")
    List<BudgetAllocation> findAllCurrentBudgets();

    @Query("SELECT DISTINCT ba.fiscalYear FROM BudgetAllocation ba ORDER BY ba.fiscalYear DESC")
    List<Integer> findDistinctFiscalYears();

    @Query("SELECT ba FROM BudgetAllocation ba " +
            "WHERE ba.department.id = :departmentId " +
            "AND ba.category.id = :categoryId " +
            "AND ba.fiscalYear = :fiscalYear " +
            "ORDER BY ba.quarter")
    List<BudgetAllocation> findByDepartmentCategoryAndFiscalYear(
            @Param("departmentId") Long departmentId,
            @Param("categoryId") Long categoryId,
            @Param("fiscalYear") int fiscalYear);

    @Query("SELECT ba FROM BudgetAllocation ba " +
            "WHERE ba.department.id = :departmentId " +
            "AND ba.fiscalYear = :fiscalYear " +
            "AND ba.quarter = :quarter " +
            "AND ba.isCurrent = true")
    List<BudgetAllocation> findCurrentByDepartmentFiscalYearAndQuarter(
            @Param("departmentId") Long departmentId,
            @Param("fiscalYear") int fiscalYear,
            @Param("quarter") Quarter quarter);

    List<BudgetAllocation> findByDepartmentIdAndFiscalYearAndQuarter(
            Long departmentId,
            int fiscalYear,
            Quarter quarter);

	@Query("SELECT ba FROM BudgetAllocation ba WHERE " +
       "(:departmentId IS NULL OR ba.department.id = :departmentId) " +
       "AND ba.fiscalYear = :fiscalYear")
List<BudgetAllocation> findByDepartmentIdAndFiscalYear(
    @Param("departmentId") Long departmentId,
    @Param("fiscalYear") int fiscalYear);
}
