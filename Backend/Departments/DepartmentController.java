package org.mm.FinanceTracker.Departments;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("api/departments")
public class DepartmentController {

    @Autowired
    DepartmentRepository departmentRepository;

    @Autowired
    DepartmentPerformanceRepository performanceRepository;

    @GetMapping("/")
    public ResponseEntity<List<Department>> getAllDepartments() {
        List<Department> result = new ArrayList<>();
        departmentRepository.findAll().forEach(result::add);
        return result.isEmpty() 
            ? new ResponseEntity<>(HttpStatus.NO_CONTENT) 
            : new ResponseEntity<>(result, HttpStatus.OK);
    }

    @GetMapping("/{departmentId}/performance")
    public ResponseEntity<List<DepartmentPerformance>> getPerformanceByDepartment(
            @PathVariable Long departmentId) {

        List<DepartmentPerformance> result = performanceRepository.findByDepartmentId(departmentId);
        return result.isEmpty()
                ? new ResponseEntity<>(HttpStatus.NO_CONTENT)
                : new ResponseEntity<>(result, HttpStatus.OK);
    }

    @PostMapping("/")
    public ResponseEntity<Department> createDepartment(@Valid @RequestBody DepartmentRequest request) {
        Department department = new Department(
            request.name(),
            request.headcount(),
            request.currentEfficiency(),
            request.currentBudget(),
            request.fiscalYear(),
                request.latitude(),
                request.longitude()
        );
        return new ResponseEntity<>(departmentRepository.save(department), HttpStatus.CREATED);
    }

    @GetMapping("/performance/")
    public ResponseEntity<List<DepartmentPerformance>> getAllPerformance() {
        List<DepartmentPerformance> result = new ArrayList<>();
        performanceRepository.findAll().forEach(result::add);
        return result.isEmpty()
            ? new ResponseEntity<>(HttpStatus.NO_CONTENT)
            : new ResponseEntity<>(result, HttpStatus.OK);
    }

    @PostMapping("/performance/")
    @Transactional
    public ResponseEntity<DepartmentPerformance> createPerformance(
            @RequestBody DepartmentPerformanceRequest request) {

        Department department = departmentRepository.findById(request.departmentId())
            .orElseThrow(() -> new RuntimeException("Department not found"));

        DepartmentPerformance performance = new DepartmentPerformance(
            department,
            request.recordedDate(),
            request.spend(),
            request.revenue(),
            request.efficiency(),
            request.isCurrent()
        );

        if (performance.getIsCurrent()) {
            performanceRepository.unsetCurrentFlags(department.getId(), 0L);
            department.setCurrentEfficiency(performance.getEfficiency());
            departmentRepository.save(department);
        }

        return new ResponseEntity<>(performanceRepository.save(performance), HttpStatus.CREATED);
    }

    @PutMapping("/performance/{id}")
    @Transactional
    public ResponseEntity<DepartmentPerformance> updatePerformance(
            @PathVariable Long id,
            @RequestBody DepartmentPerformanceRequest request) {

        DepartmentPerformance existing = performanceRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Performance record not found"));

        if (request.isCurrent() && !existing.getIsCurrent()) {
            performanceRepository.unsetCurrentFlags(existing.getDepartment().getId(), id);
            existing.getDepartment().setCurrentEfficiency(request.efficiency());
            departmentRepository.save(existing.getDepartment());
        }

        existing.setRecordedDate(request.recordedDate());
        existing.setSpend(request.spend());
        existing.setRevenue(request.revenue());
        existing.setEfficiency(request.efficiency());
        existing.setIsCurrent(request.isCurrent());

        return new ResponseEntity<>(performanceRepository.save(existing), HttpStatus.OK);
    }

    @DeleteMapping("/performance/{id}")
    @Transactional
    public ResponseEntity<HttpStatus> deletePerformance(@PathVariable Long id) {
        DepartmentPerformance performance = performanceRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Performance record not found"));

        if (performance.getIsCurrent()) {
            performanceRepository.findFirstByDepartmentIdAndIdNotOrderByRecordedDateDesc(
                performance.getDepartment().getId(), id
            ).ifPresent(latest -> {
                latest.setIsCurrent(true);
                performanceRepository.save(latest);
                performance.getDepartment().setCurrentEfficiency(latest.getEfficiency());
                departmentRepository.save(performance.getDepartment());
            });
        }

        performanceRepository.deleteById(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
