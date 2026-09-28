package org.mm.FinanceTracker.Vendors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PayablesAgingService {

    @Autowired
    private PayablesAgingRepository payablesAgingRepository;

    public List<PayablesAging> getAllAgingRecords() {
        return payablesAgingRepository.findAllOrderedByDaysOutstanding();
    }

    public List<PayablesAging> getAgingRecordsByBucket(String bucket) {
        return payablesAgingRepository.findByAgingBucket(bucket);
    }

    public List<PayablesAging> getAgingRecordsByVendor(Long vendorId) {
        return payablesAgingRepository.findByVendorId(vendorId);
    }

    public List<Object[]> getAgingSummary() {
        return payablesAgingRepository.getSummaryByAgingBucket();
    }
}