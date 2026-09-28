package org.mm.FinanceTracker.Vendors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payables-aging")
public class PayablesAgingController {

    @Autowired
    private PayablesAgingRepository payablesAgingRepository;

    @GetMapping("/")
    public ResponseEntity<List<PayablesAging>> getAllAgingRecords() {
        List<PayablesAging> records = payablesAgingRepository.findAllOrderedByDaysOutstanding();
        return records.isEmpty()
            ? new ResponseEntity<>(HttpStatus.NO_CONTENT)
            : new ResponseEntity<>(records, HttpStatus.OK);
    }

    @GetMapping("/by-bucket")
    public ResponseEntity<List<PayablesAging>> getByAgingBucket(@RequestParam String bucket) {
        List<PayablesAging> records = payablesAgingRepository.findByAgingBucket(bucket);
        return records.isEmpty()
            ? new ResponseEntity<>(HttpStatus.NO_CONTENT)
            : new ResponseEntity<>(records, HttpStatus.OK);
    }

    @GetMapping("/by-vendor")
    public ResponseEntity<List<PayablesAging>> getByVendor(@RequestParam Long vendorId) {
        List<PayablesAging> records = payablesAgingRepository.findByVendorId(vendorId);
        return records.isEmpty()
            ? new ResponseEntity<>(HttpStatus.NO_CONTENT)
            : new ResponseEntity<>(records, HttpStatus.OK);
    }

    @GetMapping("/summary")
    public ResponseEntity<List<Object[]>> getAgingSummary() {
        List<Object[]> summary = payablesAgingRepository.getSummaryByAgingBucket();
        return summary.isEmpty()
            ? new ResponseEntity<>(HttpStatus.NO_CONTENT)
            : new ResponseEntity<>(summary, HttpStatus.OK);
    }
}