package org.mm.FinanceTracker.CashFlow.services;

import org.mm.FinanceTracker.CashFlow.models.ConfidenceFactor;
import org.mm.FinanceTracker.CashFlow.repositories.ConfidenceFactorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class ConfidenceFactorService {

    @Autowired
    private ConfidenceFactorRepository confidenceFactorRepository;

    public List<ConfidenceFactor> getAllConfidenceFactors() {
        return confidenceFactorRepository.findAll();
    }

    public Optional<ConfidenceFactor> getConfidenceFactorById(Long id) {
        return confidenceFactorRepository.findById(id);
    }

    @Transactional
    public ConfidenceFactor createConfidenceFactor(ConfidenceFactor factor) {
        return confidenceFactorRepository.save(factor);
    }

    @Transactional
    public ConfidenceFactor updateConfidenceFactor(Long id, ConfidenceFactor factorDetails) {
        ConfidenceFactor factor = confidenceFactorRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Confidence Factor not found with id: " + id));
        
        factor.setFactor(factorDetails.getFactor());
        factor.setImpact(factorDetails.getImpact());
        factor.setConfidence(factorDetails.getConfidence());
        
        return confidenceFactorRepository.save(factor);
    }

    @Transactional
    public void deleteConfidenceFactor(Long id) {
        ConfidenceFactor factor = confidenceFactorRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Confidence Factor not found with id: " + id));
        confidenceFactorRepository.delete(factor);
    }

    public List<ConfidenceFactor> getConfidenceFactorsByDate(LocalDate date) {
        return confidenceFactorRepository.findByConfidenceDate(date);
    }
}
