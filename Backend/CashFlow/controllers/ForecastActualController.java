package org.mm.FinanceTracker.CashFlow.controllers;

import org.mm.FinanceTracker.CashFlow.models.ForecastActual;
import org.mm.FinanceTracker.CashFlow.models.ForecastActualId;
import org.mm.FinanceTracker.CashFlow.repositories.ForecastActualRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/forecast-actuals")
public class ForecastActualController {

    @Autowired
    private ForecastActualRepository forecastActualRepository;

    @GetMapping("/")
    public ResponseEntity<List<ForecastActual>> getAllForecastActuals() {
        List<ForecastActual> actuals = forecastActualRepository.findAll();
        return actuals.isEmpty()
            ? new ResponseEntity<>(HttpStatus.NO_CONTENT)
            : new ResponseEntity<>(actuals, HttpStatus.OK);
    }

    @GetMapping("/{forecastId}/{actualDate}")
    public ResponseEntity<ForecastActual> getForecastActualById(
            @PathVariable Long forecastId, 
            @PathVariable LocalDate actualDate) {
        
        ForecastActualId id = new ForecastActualId(forecastId, actualDate);
        Optional<ForecastActual> actual = forecastActualRepository.findById(id);
        return actual.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
            .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @PostMapping("/")
    public ResponseEntity<ForecastActual> createForecastActual(@RequestBody ForecastActual actual) {
        ForecastActual savedActual = forecastActualRepository.save(actual);
        return new ResponseEntity<>(savedActual, HttpStatus.CREATED);
    }

    @PutMapping("/{forecastId}/{actualDate}")
    public ResponseEntity<ForecastActual> updateForecastActual(
            @PathVariable Long forecastId, 
            @PathVariable LocalDate actualDate,
            @RequestBody ForecastActual actualDetails) {
        
        ForecastActualId id = new ForecastActualId(forecastId, actualDate);
        Optional<ForecastActual> existingActualOpt = forecastActualRepository.findById(id);
        
        if (existingActualOpt.isPresent()) {
            ForecastActual existingActual = existingActualOpt.get();
            existingActual.setActualAmount(actualDetails.getActualAmount());
            existingActual.setVariance(actualDetails.getVariance());
            existingActual.setVariancePercentage(actualDetails.getVariancePercentage());
            
            ForecastActual updatedActual = forecastActualRepository.save(existingActual);
            return new ResponseEntity<>(updatedActual, HttpStatus.OK);
        } else {
            actualDetails.setId(id);
            ForecastActual savedActual = forecastActualRepository.save(actualDetails);
            return new ResponseEntity<>(savedActual, HttpStatus.CREATED);
        }
    }

    @DeleteMapping("/{forecastId}/{actualDate}")
    public ResponseEntity<HttpStatus> deleteForecastActual(
            @PathVariable Long forecastId, 
            @PathVariable LocalDate actualDate) {
        try {
            ForecastActualId id = new ForecastActualId(forecastId, actualDate);
            forecastActualRepository.deleteById(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/by-forecast")
    public ResponseEntity<List<ForecastActual>> getActualsByForecast(@RequestParam Long forecastId) {
        List<ForecastActual> actuals = forecastActualRepository.findByForecastId(forecastId);
        return actuals.isEmpty()
            ? new ResponseEntity<>(HttpStatus.NO_CONTENT)
            : new ResponseEntity<>(actuals, HttpStatus.OK);
    }
}
