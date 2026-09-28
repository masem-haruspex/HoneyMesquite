package org.mm.FinanceTracker.Budget;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("api/categories")
public class CategoryController {

    @Autowired
    CategoryRepository repository;

    @PostMapping("/")
    public ResponseEntity<CategoryResponse> create(@RequestBody CategoryRequest input) {
        Category result = repository.save(
                new Category(
                        input.name(),
                        input.type(),
                        input.allocations(),
                        LocalDateTime.now(),
                        input.accountCode()  
                ));
        return new ResponseEntity<>(
                new CategoryResponse(
                        result.getId(),
                        result.getName(),
                        result.getType(),
                        convertAllocations(result.getAllocations()),
                        result.getCreatedAt(),
                        result.getAccountCode()  
                ), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CategoryResponse> update(@PathVariable long id, @RequestBody CategoryRequest input) {
        Category existing = repository.findById(id).orElse(null);
        if (existing != null) {
            existing.setName(input.name());
            existing.setType(input.type());
            existing.setAccountCode(input.accountCode());  
            repository.save(existing);
            return new ResponseEntity<>(
                    new CategoryResponse(
                            existing.getId(),
                            existing.getName(),
                            existing.getType(),
                            convertAllocations(existing.getAllocations()),
                            existing.getCreatedAt(),
                            existing.getAccountCode()  
                    ), HttpStatus.OK);
        } else {
            return create(input);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<HttpStatus> delete(@PathVariable long id) {
        repository.deleteById(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @GetMapping("/")
    public ResponseEntity<List<CategoryResponse>> getAll() {
        List<CategoryResponse> result = new ArrayList<>();
        repository.findAll().forEach(item -> result.add(
                new CategoryResponse(
                        item.getId(),
                        item.getName(),
                        item.getType(),
                        convertAllocations(item.getAllocations()),
                        item.getCreatedAt(),
                        item.getAccountCode()  
                )));

        if (result.isEmpty())
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        return new ResponseEntity<>(result, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CategoryResponse> findById(@PathVariable long id) {
        Category found = repository.findById(id).orElse(null);
        if(found == null)
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);

        return new ResponseEntity<>(
                new CategoryResponse(
                        found.getId(),
                        found.getName(),
                        found.getType(),
                        convertAllocations(found.getAllocations()),
                        found.getCreatedAt(),
                        found.getAccountCode()  
                ), HttpStatus.OK);
    }

    private List<AllocationSummary> convertAllocations(List<BudgetAllocation> allocations) {
        if (allocations == null) return List.of();

        return allocations.stream()
                .map(allocation -> new AllocationSummary(
                        allocation.getId(),
                        allocation.getDepartment().getId(),
                        allocation.getDepartment().getName(),
                        allocation.getFiscalYear(),
                        allocation.getQuarter(),
                        allocation.getBudgetedAmount(),
                        allocation.getIsCurrent()
                ))
                .toList();
    }
}
