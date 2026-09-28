package org.mm.FinanceTracker.Metrics;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class CompanyMetricsService {

    @Autowired
    private CompanyMetricsRepository companyMetricsRepository;

    public List<CompanyMetric> getAllMetrics() {
        return companyMetricsRepository.findAll();
    }

    public Optional<CompanyMetric> getMetricById(Integer id) {
        return companyMetricsRepository.findById(id);
    }

    public List<CompanyMetric> getMetricsByDate(java.time.LocalDate metricDate) {
        return companyMetricsRepository.findByMetricDate(metricDate);
    }

    @Transactional
    public CompanyMetric createMetric(CompanyMetric metric) {
        metric.setCalculatedAt(LocalDateTime.now());
        return companyMetricsRepository.save(metric);
    }

    @Transactional
    public CompanyMetric updateMetric(Integer id, CompanyMetric metricDetails) {
        CompanyMetric metric = companyMetricsRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Company Metric not found with id: " + id));
        
        metric.setMetricDate(metricDetails.getMetricDate());
        metric.setMetricName(metricDetails.getMetricName());
        metric.setMetricValue(metricDetails.getMetricValue());
        metric.setMetricUnit(metricDetails.getMetricUnit());
        metric.setSourceTable(metricDetails.getSourceTable());
        metric.setSourceId(metricDetails.getSourceId());
        metric.setCalculatedAt(LocalDateTime.now());
        
        return companyMetricsRepository.save(metric);
    }

    @Transactional
    public void deleteMetric(Integer id) {
        CompanyMetric metric = companyMetricsRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Company Metric not found with id: " + id));
        companyMetricsRepository.delete(metric);
    }
}