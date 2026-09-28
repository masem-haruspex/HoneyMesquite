package org.mm.FinanceTracker.CashFlow.controllers;

import jakarta.validation.Valid;
import org.mm.FinanceTracker.CashFlow.models.RiskFactor;
import org.mm.FinanceTracker.CashFlow.repositories.RiskFactorRepository;
import org.mm.FinanceTracker.CashFlow.requests.RiskFactorRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("api/cashflow/risks")
public class RiskFactorController {

    @Autowired
    private RiskFactorRepository riskRepository;

    @GetMapping("/")
    public ResponseEntity<List<RiskFactor>> getAllRisks() {
        List<RiskFactor> result = new ArrayList<>();
        riskRepository.findAll().forEach(result::add);
        return result.isEmpty()
                ? new ResponseEntity<>(HttpStatus.NO_CONTENT)
                : new ResponseEntity<>(result, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<RiskFactor> getRiskById(@PathVariable String id) {
        return riskRepository.findById(id)
                .map(risk -> new ResponseEntity<>(risk, HttpStatus.OK))
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @PostMapping("/")
    public ResponseEntity<RiskFactor> createRisk(
            @Valid @RequestBody RiskFactorRequest request) {
        RiskFactor risk = new RiskFactor(
                request.id(),
                request.name(),
                request.likelihood().shortValue(),
                request.impact().shortValue(),
                request.velocity().shortValue(),
                request.mitigation()
        );
        return new ResponseEntity<>(riskRepository.save(risk), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<RiskFactor> updateRisk(
            @PathVariable String id,
            @Valid @RequestBody RiskFactorRequest request) {
        RiskFactor existing = riskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Risk not found"));
        existing.setName(request.name());
        existing.setLikelihood(request.likelihood().shortValue());
        existing.setImpact(request.impact().shortValue());
        existing.setVelocity(request.velocity().shortValue());
        existing.setMitigation(request.mitigation());
        return new ResponseEntity<>(riskRepository.save(existing), HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<HttpStatus> deleteRisk(@PathVariable String id) {
        riskRepository.deleteById(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}