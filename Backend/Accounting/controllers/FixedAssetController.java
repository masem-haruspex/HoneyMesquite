package org.mm.FinanceTracker.Accounting.controllers;

import org.mm.FinanceTracker.Accounting.FixedAsset;
import org.mm.FinanceTracker.Accounting.services.AccountingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/fixed-assets")
public class FixedAssetController {

    @Autowired
    private AccountingService accountingService;

    @GetMapping("/")
    public ResponseEntity<List<FixedAsset>> getAllAssets() {
        List<FixedAsset> assets = accountingService.getAllFixedAssets();
        return assets.isEmpty()
            ? ResponseEntity.noContent().build()
            : ResponseEntity.ok(assets);
    }

    @GetMapping("/active")
    public ResponseEntity<List<FixedAsset>> getActiveAssets() {
        List<FixedAsset> assets = accountingService.getActiveFixedAssets();
        return ResponseEntity.ok(assets);
    }

    @GetMapping("/{id}")
    public ResponseEntity<FixedAsset> getAssetById(@PathVariable Long id) {
        FixedAsset asset = accountingService.getFixedAssetById(id);
        return asset != null
            ? ResponseEntity.ok(asset)
            : ResponseEntity.notFound().build();
    }

    @PostMapping("/")
    public ResponseEntity<FixedAsset> createAsset(@RequestBody FixedAsset asset) {
        FixedAsset saved = accountingService.createFixedAsset(asset);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<FixedAsset> updateAsset(
            @PathVariable Long id,
            @RequestBody FixedAsset assetDetails) {
        
        FixedAsset updated = accountingService.updateFixedAsset(id, assetDetails);
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/{id}/depreciate")
    public ResponseEntity<FixedAsset> recordDepreciation(
            @PathVariable Long id,
            @RequestParam BigDecimal amount) {
        
        FixedAsset updated = accountingService.recordDepreciation(id, amount);
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/{id}/retire")
    public ResponseEntity<FixedAsset> retireAsset(
            @PathVariable Long id,
            @RequestParam(required = false) BigDecimal salePrice,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate retirementDate) {
        
        FixedAsset retired = accountingService.retireFixedAsset(id, salePrice, retirementDate);
        return ResponseEntity.ok(retired);
    }

    @GetMapping("/depreciation-schedule/{id}")
    public ResponseEntity<List<Map<String, Object>>> getDepreciationSchedule(@PathVariable Long id) {
        List<Map<String, Object>> schedule = accountingService.getDepreciationSchedule(id);
        return ResponseEntity.ok(schedule);
    }

    @GetMapping("/net-book-value")
    public ResponseEntity<BigDecimal> getTotalNetBookValue() {
        BigDecimal total = accountingService.getTotalNetBookValue();
        return ResponseEntity.ok(total);
    }

    @GetMapping("/by-type")
    public ResponseEntity<Map<String, BigDecimal>> getNetBookValueByType() {
        Map<String, BigDecimal> values = accountingService.getNetBookValueByType();
        return ResponseEntity.ok(values);
    }
}
