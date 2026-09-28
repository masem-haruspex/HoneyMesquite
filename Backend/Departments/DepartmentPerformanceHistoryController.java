package org.mm.FinanceTracker.Departments;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/department-performance-history")
public class DepartmentPerformanceHistoryController {

    @Autowired
    private DepartmentPerformanceRepository departmentPerformanceRepository;

    @GetMapping("/")
    public ResponseEntity<List<DepartmentPerformance>> getAllPerformanceHistory() {
        List<DepartmentPerformance> history = departmentPerformanceRepository.findAll();
        return history.isEmpty()
            ? new ResponseEntity<>(HttpStatus.NO_CONTENT)
            : new ResponseEntity<>(history, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<DepartmentPerformance> getPerformanceHistoryById(@PathVariable Long id) {
        Optional<DepartmentPerformance> history = departmentPerformanceRepository.findById(id);
        return history.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
            .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @PostMapping("/")
    public ResponseEntity<DepartmentPerformance> createPerformanceHistory(@RequestBody DepartmentPerformance history) {
        DepartmentPerformance savedHistory = departmentPerformanceRepository.save(history);
        return new ResponseEntity<>(savedHistory, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<DepartmentPerformance> updatePerformanceHistory(@PathVariable Long id, @RequestBody DepartmentPerformance historyDetails) {
        Optional<DepartmentPerformance> existingHistoryOpt = departmentPerformanceRepository.findById(id);
        
        if (existingHistoryOpt.isPresent()) {
            DepartmentPerformance existingHistory = existingHistoryOpt.get();
            existingHistory.setDepartment(historyDetails.getDepartment());
            existingHistory.setRecordedDate(historyDetails.getRecordedDate());
            existingHistory.setSpend(historyDetails.getSpend());
            existingHistory.setRevenue(historyDetails.getRevenue());
            existingHistory.setEfficiency(historyDetails.getEfficiency());
            existingHistory.setIsCurrent(historyDetails.getIsCurrent());
            
            DepartmentPerformance updatedHistory = departmentPerformanceRepository.save(existingHistory);
            return new ResponseEntity<>(updatedHistory, HttpStatus.OK);
        } else {
            historyDetails.setId(id);
            DepartmentPerformance savedHistory = departmentPerformanceRepository.save(historyDetails);
            return new ResponseEntity<>(savedHistory, HttpStatus.CREATED);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<HttpStatus> deletePerformanceHistory(@PathVariable Long id) {
        try {
            departmentPerformanceRepository.deleteById(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/by-department")
    public ResponseEntity<List<DepartmentPerformance>> getPerformanceHistoryByDepartment(@RequestParam Long departmentId) {
        List<DepartmentPerformance> history = departmentPerformanceRepository.findByDepartmentId(departmentId);
        return history.isEmpty()
            ? new ResponseEntity<>(HttpStatus.NO_CONTENT)
            : new ResponseEntity<>(history, HttpStatus.OK);
    }

    @GetMapping("/current")
    public ResponseEntity<List<DepartmentPerformance>> getCurrentPerformance() {
        List<DepartmentPerformance> history = departmentPerformanceRepository.findByIsCurrentTrue();
        return history.isEmpty()
            ? new ResponseEntity<>(HttpStatus.NO_CONTENT)
            : new ResponseEntity<>(history, HttpStatus.OK);
    }
}