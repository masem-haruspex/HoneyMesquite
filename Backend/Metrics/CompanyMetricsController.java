package org.mm.FinanceTracker.Metrics;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/company-metrics")
public class CompanyMetricsController {

    @Autowired
    private CompanyMetricsRepository companyMetricsRepository;

    @GetMapping("/")
    public ResponseEntity<List<CompanyMetric>> getAllMetrics() {
        List<CompanyMetric> metrics = new ArrayList<>();
        companyMetricsRepository.findAll().forEach(metrics::add);
        return metrics.isEmpty()
            ? new ResponseEntity<>(HttpStatus.NO_CONTENT)
            : new ResponseEntity<>(metrics, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CompanyMetric> getMetricById(@PathVariable Integer id) {
        Optional<CompanyMetric> metric = companyMetricsRepository.findById(id);
        return metric.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
            .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @GetMapping("/date/{metricDate}")
    public ResponseEntity<List<CompanyMetric>> getMetricsByDate(@PathVariable LocalDate metricDate) {
        List<CompanyMetric> metrics = companyMetricsRepository.findByMetricDate(metricDate);
        return metrics.isEmpty()
            ? new ResponseEntity<>(HttpStatus.NO_CONTENT)
            : new ResponseEntity<>(metrics, HttpStatus.OK);
    }

    @PostMapping("/")
    public ResponseEntity<CompanyMetric> createMetric(@Valid @RequestBody CompanyMetric metric) {
        CompanyMetric savedMetric = companyMetricsRepository.save(metric);
        return new ResponseEntity<>(savedMetric, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CompanyMetric> updateMetric(@PathVariable Integer id, @Valid @RequestBody CompanyMetric metricDetails) {
        Optional<CompanyMetric> existingMetricOpt = companyMetricsRepository.findById(id);
        
        if (existingMetricOpt.isPresent()) {
            CompanyMetric existingMetric = existingMetricOpt.get();
            existingMetric.setMetricDate(metricDetails.getMetricDate());
            existingMetric.setMetricName(metricDetails.getMetricName());
            existingMetric.setMetricValue(metricDetails.getMetricValue());
            existingMetric.setMetricUnit(metricDetails.getMetricUnit());
            existingMetric.setSourceTable(metricDetails.getSourceTable());
            existingMetric.setSourceId(metricDetails.getSourceId());
            
            CompanyMetric updatedMetric = companyMetricsRepository.save(existingMetric);
            return new ResponseEntity<>(updatedMetric, HttpStatus.OK);
        } else {
            metricDetails.setId(id);
            CompanyMetric savedMetric = companyMetricsRepository.save(metricDetails);
            return new ResponseEntity<>(savedMetric, HttpStatus.CREATED);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<HttpStatus> deleteMetric(@PathVariable Integer id) {
        try {
            companyMetricsRepository.deleteById(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}