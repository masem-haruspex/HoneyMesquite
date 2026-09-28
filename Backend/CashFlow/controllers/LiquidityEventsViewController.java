package org.mm.FinanceTracker.CashFlow.controllers;

import org.mm.FinanceTracker.CashFlow.models.LiquidityEventsView;
import org.mm.FinanceTracker.CashFlow.repositories.LiquidityEventsViewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/liquidity-events-view")
public class LiquidityEventsViewController {

    @Autowired
    private LiquidityEventsViewRepository liquidityEventsViewRepository;

    @GetMapping("/")
    public ResponseEntity<List<LiquidityEventsView>> getAllLiquidityEvents() {
        List<LiquidityEventsView> events = liquidityEventsViewRepository.findAllOrderedByDate();
        return events.isEmpty()
            ? new ResponseEntity<>(HttpStatus.NO_CONTENT)
            : new ResponseEntity<>(events, HttpStatus.OK);
    }

    @GetMapping("/by-date-range")
    public ResponseEntity<List<LiquidityEventsView>> getByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        List<LiquidityEventsView> events = liquidityEventsViewRepository.findByDateRange(startDate, endDate);
        return events.isEmpty()
            ? new ResponseEntity<>(HttpStatus.NO_CONTENT)
            : new ResponseEntity<>(events, HttpStatus.OK);
    }
}