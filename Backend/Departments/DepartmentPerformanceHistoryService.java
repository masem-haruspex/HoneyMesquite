package org.mm.FinanceTracker.Departments;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class DepartmentPerformanceHistoryService {

    @Autowired
    private DepartmentPerformanceRepository departmentPerformanceRepository;

    public List<DepartmentPerformance> getAllPerformanceHistory() {
        return departmentPerformanceRepository.findAll();
    }

    public Optional<DepartmentPerformance> getPerformanceHistoryById(Long id) {
        return departmentPerformanceRepository.findById(id);
    }

    @Transactional
    public DepartmentPerformance createPerformanceHistory(DepartmentPerformance history) {
        return departmentPerformanceRepository.save(history);
    }

    @Transactional
    public DepartmentPerformance updatePerformanceHistory(Long id, DepartmentPerformance historyDetails) {
        DepartmentPerformance history = departmentPerformanceRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Department Performance History not found with id: " + id));
        
        history.setDepartment(historyDetails.getDepartment());
        history.setRecordedDate(historyDetails.getRecordedDate());
        history.setSpend(historyDetails.getSpend());
        history.setRevenue(historyDetails.getRevenue());
        history.setEfficiency(historyDetails.getEfficiency());
        history.setIsCurrent(historyDetails.getIsCurrent());
        
        return departmentPerformanceRepository.save(history);
    }

    @Transactional
    public void deletePerformanceHistory(Long id) {
        DepartmentPerformance history = departmentPerformanceRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Department Performance History not found with id: " + id));
        departmentPerformanceRepository.delete(history);
    }

    public List<DepartmentPerformance> getPerformanceHistoryByDepartment(Long departmentId) {
        return departmentPerformanceRepository.findByDepartmentId(departmentId);
    }

    public List<DepartmentPerformance> getCurrentPerformance() {
        return departmentPerformanceRepository.findByIsCurrentTrue();
    }
}