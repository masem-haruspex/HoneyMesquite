package org.mm.FinanceTracker.CashFlow.controllers;

import org.mm.FinanceTracker.CashFlow.models.FundingEvent;
import org.mm.FinanceTracker.CashFlow.repositories.FundingEventRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/funding-events")
public class FundingEventController {

    @Autowired
    private FundingEventRepository fundingEventRepository;

    @GetMapping("/")
    public ResponseEntity<List<FundingEvent>> getAllFundingEvents() {
        List<FundingEvent> events = fundingEventRepository.findAll();
        return events.isEmpty()
            ? new ResponseEntity<>(HttpStatus.NO_CONTENT)
            : new ResponseEntity<>(events, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<FundingEvent> getFundingEventById(@PathVariable Long id) {
        Optional<FundingEvent> event = fundingEventRepository.findById(id);
        return event.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
            .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @PostMapping("/")
    public ResponseEntity<FundingEvent> createFundingEvent(@RequestBody FundingEvent event) {
        FundingEvent savedEvent = fundingEventRepository.save(event);
        return new ResponseEntity<>(savedEvent, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<FundingEvent> updateFundingEvent(@PathVariable Long id, @RequestBody FundingEvent eventDetails) {
        Optional<FundingEvent> existingEventOpt = fundingEventRepository.findById(id);
        
        if (existingEventOpt.isPresent()) {
            FundingEvent existingEvent = existingEventOpt.get();
            existingEvent.setRunwayAnalysis(eventDetails.getRunwayAnalysis());
            existingEvent.setDate(eventDetails.getDate());
            existingEvent.setAmount(eventDetails.getAmount());
            existingEvent.setName(eventDetails.getName());
            
            FundingEvent updatedEvent = fundingEventRepository.save(existingEvent);
            return new ResponseEntity<>(updatedEvent, HttpStatus.OK);
        } else {
            eventDetails.setId(id);
            FundingEvent savedEvent = fundingEventRepository.save(eventDetails);
            return new ResponseEntity<>(savedEvent, HttpStatus.CREATED);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<HttpStatus> deleteFundingEvent(@PathVariable Long id) {
        try {
            fundingEventRepository.deleteById(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/by-runway")
    public ResponseEntity<List<FundingEvent>> getFundingEventsByRunway(@RequestParam Long runwayId) {
        List<FundingEvent> events = fundingEventRepository.findByRunwayAnalysisId(runwayId);
        return events.isEmpty()
            ? new ResponseEntity<>(HttpStatus.NO_CONTENT)
            : new ResponseEntity<>(events, HttpStatus.OK);
    }
}