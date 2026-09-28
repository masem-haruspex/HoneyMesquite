package org.mm.FinanceTracker.CashFlow.services;

import org.mm.FinanceTracker.CashFlow.models.ForecastActual;
import org.mm.FinanceTracker.CashFlow.models.ForecastActualId;
import org.mm.FinanceTracker.CashFlow.repositories.ForecastActualRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class ForecastActualService {

    @Autowired
    private ForecastActualRepository forecastActualRepository;

    public List<ForecastActual> getAllForecastActuals() {
        return forecastActualRepository.findAll();
    }

    public Optional<ForecastActual> getForecastActualById(ForecastActualId id) {
        return forecastActualRepository.findById(id);
    }

    @Transactional
    public ForecastActual createForecastActual(ForecastActual actual) {
        return forecastActualRepository.save(actual);
    }

    @Transactional
    public ForecastActual updateForecastActual(ForecastActualId id, ForecastActual actualDetails) {
        ForecastActual actual = forecastActualRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Forecast Actual not found with id: " + id));
        
        actual.setActualAmount(actualDetails.getActualAmount());
        actual.setVariance(actualDetails.getVariance());
        actual.setVariancePercentage(actualDetails.getVariancePercentage());
        
        return forecastActualRepository.save(actual);
    }

    @Transactional
    public void deleteForecastActual(ForecastActualId id) {
        ForecastActual actual = forecastActualRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Forecast Actual not found with id: " + id));
        forecastActualRepository.delete(actual);
    }

    public List<ForecastActual> getActualsByForecast(Long forecastId) {
        return forecastActualRepository.findByForecastId(forecastId);
    }
}