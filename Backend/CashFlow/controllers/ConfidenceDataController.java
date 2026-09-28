package org.mm.FinanceTracker.CashFlow.controllers;

import org.mm.FinanceTracker.CashFlow.models.ConfidenceData;
import org.mm.FinanceTracker.CashFlow.repositories.ConfidenceDataRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/confidence-data")
public class ConfidenceDataController {

    @Autowired
    private ConfidenceDataRepository confidenceDataRepository;

    @GetMapping("/")
    public ResponseEntity<List<ConfidenceData>> getAllConfidenceData() {
        List<ConfidenceData> data = confidenceDataRepository.findAll();
        return data.isEmpty()
            ? new ResponseEntity<>(HttpStatus.NO_CONTENT)
            : new ResponseEntity<>(data, HttpStatus.OK);
    }

    @GetMapping("/{date}")
    public ResponseEntity<ConfidenceData> getConfidenceDataByDate(@PathVariable LocalDate date) {
        Optional<ConfidenceData> data = confidenceDataRepository.findById(date);
        return data.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
            .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @PostMapping("/")
    public ResponseEntity<ConfidenceData> createConfidenceData(@RequestBody ConfidenceData data) {
        ConfidenceData savedData = confidenceDataRepository.save(data);
        return new ResponseEntity<>(savedData, HttpStatus.CREATED);
    }

    @PutMapping("/{date}")
    public ResponseEntity<ConfidenceData> updateConfidenceData(@PathVariable LocalDate date, @RequestBody ConfidenceData dataDetails) {
        Optional<ConfidenceData> existingDataOpt = confidenceDataRepository.findById(date);
        
        if (existingDataOpt.isPresent()) {
            ConfidenceData existingData = existingDataOpt.get();
            existingData.setLowerBound(dataDetails.getLowerBound());
            existingData.setUpperBound(dataDetails.getUpperBound());
            existingData.setProjectedAmount(dataDetails.getProjectedAmount());
            existingData.setConfidenceLevel(dataDetails.getConfidenceLevel());
            
            ConfidenceData updatedData = confidenceDataRepository.save(existingData);
            return new ResponseEntity<>(updatedData, HttpStatus.OK);
        } else {
            dataDetails.setDate(date);
            ConfidenceData savedData = confidenceDataRepository.save(dataDetails);
            return new ResponseEntity<>(savedData, HttpStatus.CREATED);
        }
    }

    @DeleteMapping("/{date}")
    public ResponseEntity<HttpStatus> deleteConfidenceData(@PathVariable LocalDate date) {
        try {
            confidenceDataRepository.deleteById(date);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
