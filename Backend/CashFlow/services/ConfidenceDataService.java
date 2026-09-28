package org.mm.FinanceTracker.CashFlow.services;

import org.mm.FinanceTracker.CashFlow.models.ConfidenceData;
import org.mm.FinanceTracker.CashFlow.repositories.ConfidenceDataRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class ConfidenceDataService {

    @Autowired
    private ConfidenceDataRepository confidenceDataRepository;

    public List<ConfidenceData> getAllConfidenceData() {
        return confidenceDataRepository.findAll();
    }

    public Optional<ConfidenceData> getConfidenceDataByDate(LocalDate date) {
        return confidenceDataRepository.findById(date);
    }

    @Transactional
    public ConfidenceData createConfidenceData(ConfidenceData data) {
        return confidenceDataRepository.save(data);
    }

    @Transactional
    public ConfidenceData updateConfidenceData(LocalDate date, ConfidenceData dataDetails) {
        ConfidenceData data = confidenceDataRepository.findById(date)
            .orElseThrow(() -> new RuntimeException("Confidence Data not found with date: " + date));
        
        data.setLowerBound(dataDetails.getLowerBound());
        data.setUpperBound(dataDetails.getUpperBound());
        data.setProjectedAmount(dataDetails.getProjectedAmount());
        data.setConfidenceLevel(dataDetails.getConfidenceLevel());
        
        return confidenceDataRepository.save(data);
    }

    @Transactional
    public void deleteConfidenceData(LocalDate date) {
        ConfidenceData data = confidenceDataRepository.findById(date)
            .orElseThrow(() -> new RuntimeException("Confidence Data not found with date: " + date));
        confidenceDataRepository.delete(data);
    }
}