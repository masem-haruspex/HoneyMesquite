package org.mm.FinanceTracker.ProfitLoss;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class PLLineItemService {

    @Autowired
    private ProfitLossRepository profitLossRepository;

    public List<PLLineItem> getAllLineItems() {
        List<PLLineItem> lineItems = new java.util.ArrayList<>();
        
        profitLossRepository.findAll().forEach(statement -> 
            lineItems.addAll(statement.getLineItems())
        );
        
        return lineItems;
    }

    public Optional<PLLineItem> getLineItemById(Long statementId, Long categoryId) {
        Optional<ProfitLossStatement> statementOpt = profitLossRepository.findById(statementId);
        if (statementOpt.isPresent()) {
            ProfitLossStatement statement = statementOpt.get();
            return statement.getLineItems().stream()
                .filter(item -> item.getId().getCategoryId().equals(categoryId))
                .findFirst();
        }
        return Optional.empty();
    }

    @Transactional
    public PLLineItem createLineItem(PLLineItem lineItem) {
        Optional<ProfitLossStatement> statementOpt = profitLossRepository.findById(
            lineItem.getId().getStatementId());
        
        if (statementOpt.isPresent()) {
            ProfitLossStatement statement = statementOpt.get();
            statement.getLineItems().add(lineItem);
            profitLossRepository.save(statement);
            return lineItem;
        }
        throw new RuntimeException("Profit Loss Statement not found with id: " + lineItem.getId().getStatementId());
    }

    @Transactional
    public PLLineItem updateLineItem(Long statementId, Long categoryId, PLLineItem lineItemDetails) {
        Optional<ProfitLossStatement> statementOpt = profitLossRepository.findById(statementId);
        if (statementOpt.isPresent()) {
            ProfitLossStatement statement = statementOpt.get();
            Optional<PLLineItem> itemOpt = statement.getLineItems().stream()
                .filter(item -> item.getId().getCategoryId().equals(categoryId))
                .findFirst();
                
            if (itemOpt.isPresent()) {
                PLLineItem existingItem = itemOpt.get();
                existingItem.setAmount(lineItemDetails.getAmount());
                existingItem.setVarianceFromBudget(lineItemDetails.getVarianceFromBudget());
                existingItem.setNotes(lineItemDetails.getNotes());
                existingItem.setAccountCode(lineItemDetails.getAccountCode());
                
                profitLossRepository.save(statement);
                return existingItem;
            }
        }
        throw new RuntimeException("Line Item not found with statementId: " + statementId + " and categoryId: " + categoryId);
    }

    @Transactional
    public void deleteLineItem(Long statementId, Long categoryId) {
        Optional<ProfitLossStatement> statementOpt = profitLossRepository.findById(statementId);
        if (statementOpt.isPresent()) {
            ProfitLossStatement statement = statementOpt.get();
            boolean removed = statement.getLineItems().removeIf(
                item -> item.getId().getCategoryId().equals(categoryId));
            
            if (removed) {
                profitLossRepository.save(statement);
            } else {
                throw new RuntimeException("Line Item not found with statementId: " + statementId + " and categoryId: " + categoryId);
            }
        } else {
            throw new RuntimeException("Profit Loss Statement not found with id: " + statementId);
        }
    }
}
