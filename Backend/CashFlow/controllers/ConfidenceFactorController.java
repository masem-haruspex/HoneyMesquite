package org.mm.FinanceTracker.CashFlow.controllers;

import org.mm.FinanceTracker.CashFlow.models.ConfidenceFactor;
import org.mm.FinanceTracker.CashFlow.repositories.ConfidenceFactorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/confidence-factors")
public class ConfidenceFactorController {

    @Autowired
    private ConfidenceFactorRepository confidenceFactorRepository;

    @GetMapping("/")
    public ResponseEntity<List<ConfidenceFactor>> getAllConfidenceFactors() {
        List<ConfidenceFactor> factors = confidenceFactorRepository.findAll();
        return factors.isEmpty()
            ? new ResponseEntity<>(HttpStatus.NO_CONTENT)
            : new ResponseEntity<>(factors, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ConfidenceFactor> getConfidenceFactorById(@PathVariable Long id) {
        Optional<ConfidenceFactor> factor = confidenceFactorRepository.findById(id);
        return factor.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
            .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @PostMapping("/")
    public ResponseEntity<ConfidenceFactor> createConfidenceFactor(@RequestBody ConfidenceFactor factor) {
        ConfidenceFactor savedFactor = confidenceFactorRepository.save(factor);
        return new ResponseEntity<>(savedFactor, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ConfidenceFactor> updateConfidenceFactor(@PathVariable Long id, @RequestBody ConfidenceFactor factorDetails) {
        Optional<ConfidenceFactor> existingFactorOpt = confidenceFactorRepository.findById(id);
        
        if (existingFactorOpt.isPresent()) {
            ConfidenceFactor existingFactor = existingFactorOpt.get();
            existingFactor.setFactor(factorDetails.getFactor());
            existingFactor.setImpact(factorDetails.getImpact());
            existingFactor.setConfidence(factorDetails.getConfidence());
            
            ConfidenceFactor updatedFactor = confidenceFactorRepository.save(existingFactor);
            return new ResponseEntity<>(updatedFactor, HttpStatus.OK);
        } else {
            factorDetails.setId(id);
            ConfidenceFactor savedFactor = confidenceFactorRepository.save(factorDetails);
            return new ResponseEntity<>(savedFactor, HttpStatus.CREATED);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<HttpStatus> deleteConfidenceFactor(@PathVariable Long id) {
        try {
            confidenceFactorRepository.deleteById(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/by-date")
    public ResponseEntity<List<ConfidenceFactor>> getConfidenceFactorsByDate(@RequestParam LocalDate date) {
        List<ConfidenceFactor> factors = confidenceFactorRepository.findByConfidenceDate(date);
        return factors.isEmpty()
            ? new ResponseEntity<>(HttpStatus.NO_CONTENT)
            : new ResponseEntity<>(factors, HttpStatus.OK);
    }
}
