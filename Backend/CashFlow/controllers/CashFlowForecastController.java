package org.mm.FinanceTracker.CashFlow.controllers;

import jakarta.validation.Valid;
import org.mm.FinanceTracker.CashFlow.models.CashFlowForecast;
import org.mm.FinanceTracker.CashFlow.models.ForecastActual;
import org.mm.FinanceTracker.CashFlow.models.ForecastActualId;
import org.mm.FinanceTracker.CashFlow.models.ForecastScenario;
import org.mm.FinanceTracker.CashFlow.repositories.CashFlowForecastRepository;
import org.mm.FinanceTracker.CashFlow.repositories.ForecastActualRepository;
import org.mm.FinanceTracker.CashFlow.requests.CashFlowForecastRequest;
import org.mm.FinanceTracker.CashFlow.requests.ForecastActualRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("api/cashflow/forecasts")
public class CashFlowForecastController {

    @Autowired
    private CashFlowForecastRepository forecastRepository;

    @Autowired
    private ForecastActualRepository actualRepository;

	@GetMapping("/by-period")
public ResponseEntity<List<CashFlowForecast>> getForecastsByPeriod(
        @RequestParam LocalDate start,
        @RequestParam LocalDate end) {
    List<CashFlowForecast> forecasts = forecastRepository.findByPeriodStartBetween(start, end);
    return forecasts.isEmpty()
        ? new ResponseEntity<>(HttpStatus.NO_CONTENT)
        : new ResponseEntity<>(forecasts, HttpStatus.OK);
}

    @GetMapping("/")
    public ResponseEntity<List<CashFlowForecast>> getAllForecasts() {
        List<CashFlowForecast> result = new ArrayList<>();
        forecastRepository.findAll().forEach(result::add);
        return result.isEmpty()
            ? new ResponseEntity<>(HttpStatus.NO_CONTENT)
            : new ResponseEntity<>(result, HttpStatus.OK);
    }

    @GetMapping("/{id}/actuals")
    public ResponseEntity<List<ForecastActual>> getActualsByForecast(
            @PathVariable Long id) {
        List<ForecastActual> result = actualRepository.findByForecastId(id);
        return result.isEmpty()
            ? new ResponseEntity<>(HttpStatus.NO_CONTENT)
            : new ResponseEntity<>(result, HttpStatus.OK);
    }

    @PostMapping("/")
    public ResponseEntity<CashFlowForecast> createForecast(
            @Valid @RequestBody CashFlowForecastRequest request) {
        
        CashFlowForecast forecast = new CashFlowForecast(
                ForecastScenario.valueOf(request.scenario()),
            request.periodStart(),
            request.periodEnd(),
            request.projectedAmount(),
            request.confidenceInterval(),
            request.assumptions()
        );
        
        return new ResponseEntity<>(forecastRepository.save(forecast), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CashFlowForecast> updateForecast(
            @PathVariable Long id,
            @Valid @RequestBody CashFlowForecastRequest request) {
        
        CashFlowForecast existing = forecastRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Forecast not found"));
        
        existing.setScenario(ForecastScenario.valueOf(request.scenario()));
        existing.setPeriodStart(request.periodStart());
        existing.setPeriodEnd(request.periodEnd());
        existing.setProjectedAmount(request.projectedAmount());
        existing.setConfidenceInterval(request.confidenceInterval());
        existing.setAssumptions(request.assumptions());
        
        return new ResponseEntity<>(forecastRepository.save(existing), HttpStatus.OK);
    }

    @GetMapping("/actuals/")
    public ResponseEntity<List<ForecastActual>> getAllActuals() {
        List<ForecastActual> result = new ArrayList<>();
        actualRepository.findAll().forEach(result::add);
        return result.isEmpty()
            ? new ResponseEntity<>(HttpStatus.NO_CONTENT)
            : new ResponseEntity<>(result, HttpStatus.OK);
    }

    @PostMapping("/{id}/actuals")
    @Transactional
    public ResponseEntity<ForecastActual> createActual(
            @PathVariable Long id,
            @Valid @RequestBody ForecastActualRequest request) {
        
        CashFlowForecast forecast = forecastRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Forecast not found"));
        
        ForecastActual actual = new ForecastActual(
            forecast,
            request.actualDate(),
            request.actualAmount()
        );
        
        return new ResponseEntity<>(actualRepository.save(actual), HttpStatus.CREATED);
    }

    @PutMapping("/actuals/{forecastId}/{actualDate}")
    @Transactional
    public ResponseEntity<ForecastActual> updateActual(
            @PathVariable Long forecastId,
            @PathVariable LocalDate actualDate,
            @Valid @RequestBody ForecastActualRequest request) {

        ForecastActual existing = actualRepository.findById(new ForecastActualId(forecastId, actualDate))
                .orElseThrow(() -> new RuntimeException("Actual record not found"));

        existing.setActualAmount(request.actualAmount());

        existing.setVariance(existing.getActualAmount()
                .subtract(existing.getForecast().getProjectedAmount()));

        if (existing.getForecast().getProjectedAmount().compareTo(BigDecimal.ZERO) != 0) {
            BigDecimal variancePct = existing.getVariance()
                    .divide(existing.getForecast().getProjectedAmount(), 4, RoundingMode.HALF_UP)
                    .multiply(new BigDecimal(100));
            existing.setVariancePercentage(variancePct);
        }

        return new ResponseEntity<>(actualRepository.save(existing), HttpStatus.OK);
    }

    @DeleteMapping("/actuals/{forecastId}/{actualDate}")
    public ResponseEntity<HttpStatus> deleteActual(
            @PathVariable Long forecastId,
            @PathVariable LocalDate actualDate) {

        ForecastActualId id = new ForecastActualId(forecastId, actualDate);
        if (!actualRepository.existsById(id)) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        actualRepository.deleteById(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
