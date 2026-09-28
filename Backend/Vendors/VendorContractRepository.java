package org.mm.FinanceTracker.Vendors;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface VendorContractRepository extends JpaRepository<VendorContract, Long> {
    @Query("SELECT v FROM VendorContract v WHERE v.contractEnd BETWEEN :start AND :end AND v.isActive = true")
    List<VendorContract> findActiveContractsExpiringBetween(LocalDate start, LocalDate end);

    @Query("SELECT v FROM VendorContract v WHERE ABS(v.variancePercentage) > :threshold")
    List<VendorContract> findContractsWithVarianceAbove(double threshold);

    List<VendorContract> findByContractEndBetween(LocalDate now, LocalDate thresholdDate);
}
