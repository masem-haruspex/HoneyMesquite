package org.mm.FinanceTracker.CashFlow.services;

import org.mm.FinanceTracker.CashFlow.models.FundingEvent;
import org.mm.FinanceTracker.CashFlow.repositories.FundingEventRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class FundingEventService {

    @Autowired
    private FundingEventRepository fundingEventRepository;

    public List<FundingEvent> getAllFundingEvents() {
        return fundingEventRepository.findAll();
    }

    public Optional<FundingEvent> getFundingEventById(Long id) {
        return fundingEventRepository.findById(id);
    }

    @Transactional
    public FundingEvent createFundingEvent(FundingEvent event) {
        return fundingEventRepository.save(event);
    }

    @Transactional
    public FundingEvent updateFundingEvent(Long id, FundingEvent eventDetails) {
        FundingEvent event = fundingEventRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Funding Event not found with id: " + id));
        
        event.setRunwayAnalysis(eventDetails.getRunwayAnalysis());
        event.setDate(eventDetails.getDate());
        event.setAmount(eventDetails.getAmount());
        event.setName(eventDetails.getName());
        
        return fundingEventRepository.save(event);
    }

    @Transactional
    public void deleteFundingEvent(Long id) {
        FundingEvent event = fundingEventRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Funding Event not found with id: " + id));
        fundingEventRepository.delete(event);
    }

    public List<FundingEvent> getFundingEventsByRunway(Long runwayId) {
        return fundingEventRepository.findByRunwayAnalysisId(runwayId);
    }
}