package org.mm.FinanceTracker.CashFlow.controllers;

import jakarta.validation.Valid;
import org.mm.FinanceTracker.CashFlow.models.FundingEvent;
import org.mm.FinanceTracker.CashFlow.models.RunwayAnalysis;
import org.mm.FinanceTracker.CashFlow.repositories.FundingEventRepository;
import org.mm.FinanceTracker.CashFlow.repositories.RunwayAnalysisRepository;
import org.mm.FinanceTracker.CashFlow.requests.FundingEventRequest;
import org.mm.FinanceTracker.CashFlow.requests.RunwayAnalysisRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import org.springframework.format.annotation.DateTimeFormat;

@RestController
@RequestMapping("api/cashflow/runway")
public class RunwayAnalysisController {

    @Autowired
    private RunwayAnalysisRepository runwayRepository;

    @Autowired
    private FundingEventRepository fundingRepository;


	@GetMapping("/")          
public ResponseEntity<List<RunwayAnalysis>> getRunway(
        @RequestParam(value = "start", required = false)
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,

        @RequestParam(value = "end",   required = false)
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end) {

    List<RunwayAnalysis> result =
        (start != null && end != null)
            ? runwayRepository.findByAnalysisDateBetween(start, end)
            : runwayRepository.findAll();   

    return result.isEmpty()
            ? new ResponseEntity<>(HttpStatus.NO_CONTENT)
            : new ResponseEntity<>(result, HttpStatus.OK);
}


    @GetMapping("/{id}")
    public ResponseEntity<RunwayAnalysis> getRunwayById(@PathVariable Long id) {
        return runwayRepository.findById(id)
            .map(runway -> new ResponseEntity<>(runway, HttpStatus.OK))
            .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @PostMapping("/")
    public ResponseEntity<RunwayAnalysis> createRunway(
            @Valid @RequestBody RunwayAnalysisRequest request) {
        RunwayAnalysis runway = new RunwayAnalysis(
            request.analysisDate(),
            request.cashBalance(),
            request.burnRate(),
            request.runwayMonths()
        );
        return new ResponseEntity<>(runwayRepository.save(runway), HttpStatus.CREATED);
    }

    @GetMapping("/{id}/funding")
    public ResponseEntity<List<FundingEvent>> getFundingEvents(@PathVariable Long id) {
        List<FundingEvent> result = fundingRepository.findByRunwayAnalysisId(id);
        return result.isEmpty()
            ? new ResponseEntity<>(HttpStatus.NO_CONTENT)
            : new ResponseEntity<>(result, HttpStatus.OK);
    }

	@GetMapping("/range")
public ResponseEntity<List<RunwayAnalysis>> getRunwayByRange(
        @RequestParam("start") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
        @RequestParam("end") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end) {

    List<RunwayAnalysis> result = runwayRepository.findByAnalysisDateBetween(start, end);
    return result.isEmpty()
            ? new ResponseEntity<>(HttpStatus.NO_CONTENT)
            : new ResponseEntity<>(result, HttpStatus.OK);
	}

    @PostMapping("/{id}/funding")
    public ResponseEntity<FundingEvent> addFundingEvent(
            @PathVariable Long id,
            @Valid @RequestBody FundingEventRequest request) {
        RunwayAnalysis runway = runwayRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Runway not found"));
        FundingEvent event = new FundingEvent(
            runway,
            request.date(),
            request.amount(),
            request.name()
        );
        return new ResponseEntity<>(fundingRepository.save(event), HttpStatus.CREATED);
    }
}
