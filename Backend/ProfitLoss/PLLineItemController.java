package org.mm.FinanceTracker.ProfitLoss;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/pl-line-items")
public class PLLineItemController {

    @Autowired
    private ProfitLossRepository profitLossRepository;

    @GetMapping("/")
    public ResponseEntity<List<PLLineItem>> getAllLineItems() {
        List<PLLineItem> lineItems = new ArrayList<>();
        
        profitLossRepository.findAll().forEach(statement -> 
            lineItems.addAll(statement.getLineItems())
        );
        
        return lineItems.isEmpty()
            ? new ResponseEntity<>(HttpStatus.NO_CONTENT)
            : new ResponseEntity<>(lineItems, HttpStatus.OK);
    }

    @GetMapping("/{statementId}/{categoryId}")
    public ResponseEntity<PLLineItem> getLineItemById(
            @PathVariable Long statementId, 
            @PathVariable Long categoryId) {
        
        Optional<ProfitLossStatement> statementOpt = profitLossRepository.findById(statementId);
        if (statementOpt.isPresent()) {
            ProfitLossStatement statement = statementOpt.get();
            return statement.getLineItems().stream()
                .filter(item -> item.getId().getCategoryId().equals(categoryId))
                .findFirst()
                .map(item -> new ResponseEntity<>(item, HttpStatus.OK))
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    @PostMapping("/")
    public ResponseEntity<PLLineItem> createLineItem(@Valid @RequestBody PLLineItem lineItem) {
        Optional<ProfitLossStatement> statementOpt = profitLossRepository.findById(
            lineItem.getId().getStatementId());
        
        if (statementOpt.isPresent()) {
            ProfitLossStatement statement = statementOpt.get();
            statement.getLineItems().add(lineItem);
            profitLossRepository.save(statement);
            return new ResponseEntity<>(lineItem, HttpStatus.CREATED);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    @PutMapping("/{statementId}/{categoryId}")
    public ResponseEntity<PLLineItem> updateLineItem(
            @PathVariable Long statementId,
            @PathVariable Long categoryId,
            @Valid @RequestBody PLLineItem lineItemDetails) {
        
        Optional<ProfitLossStatement> statementOpt = profitLossRepository.findById(statementId);
        if (statementOpt.isPresent()) {
            ProfitLossStatement statement = statementOpt.get();
            return statement.getLineItems().stream()
                .filter(item -> item.getId().getCategoryId().equals(categoryId))
                .findFirst()
                .map(existingItem -> {
                    existingItem.setAmount(lineItemDetails.getAmount());
                    existingItem.setVarianceFromBudget(lineItemDetails.getVarianceFromBudget());
                    existingItem.setNotes(lineItemDetails.getNotes());
                    existingItem.setAccountCode(lineItemDetails.getAccountCode());
                    
                    profitLossRepository.save(statement);
                    return new ResponseEntity<>(existingItem, HttpStatus.OK);
                })
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    @DeleteMapping("/{statementId}/{categoryId}")
    public ResponseEntity<HttpStatus> deleteLineItem(
            @PathVariable Long statementId,
            @PathVariable Long categoryId) {
        
        try {
            Optional<ProfitLossStatement> statementOpt = profitLossRepository.findById(statementId);
            if (statementOpt.isPresent()) {
                ProfitLossStatement statement = statementOpt.get();
                boolean removed = statement.getLineItems().removeIf(
                    item -> item.getId().getCategoryId().equals(categoryId));
                
                if (removed) {
                    profitLossRepository.save(statement);
                    return new ResponseEntity<>(HttpStatus.NO_CONTENT);
                }
            }
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
