package org.mm.FinanceTracker.Vendors;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface PayablesAgingRepository extends JpaRepository<PayablesAging, Long> {
    
    @Query("SELECT p FROM PayablesAging p ORDER BY p.daysOutstanding DESC")
    List<PayablesAging> findAllOrderedByDaysOutstanding();
    
    @Query("SELECT p FROM PayablesAging p WHERE p.agingBucket = :bucket")
    List<PayablesAging> findByAgingBucket(@Param("bucket") String bucket);
    
    @Query("SELECT p FROM PayablesAging p WHERE p.vendorId = :vendorId")
    List<PayablesAging> findByVendorId(@Param("vendorId") Long vendorId);
    
    @Query("SELECT p FROM PayablesAging p WHERE p.paymentStatus = :status")
    List<PayablesAging> findByPaymentStatus(@Param("status") String status);
    
    @Query("SELECT p FROM PayablesAging p WHERE p.invoiceDate <= :date")
    List<PayablesAging> findOlderThan(@Param("date") LocalDate date);
    
    @Query("SELECT SUM(p.amount) FROM PayablesAging p WHERE p.agingBucket = :bucket")
    BigDecimal getTotalAmountByBucket(@Param("bucket") String bucket);
    
    @Query("SELECT p.agingBucket, SUM(p.amount) FROM PayablesAging p GROUP BY p.agingBucket")
    List<Object[]> getSummaryByAgingBucket();
}
