package org.mm.FinanceTracker.Departments;

import com.fasterxml.jackson.annotation.JsonCreator;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;

public record DepartmentRequest(
		@NotBlank String name,
		@Positive int headcount,
		@DecimalMin("0.00") @DecimalMax("100.00") BigDecimal currentEfficiency,
		@Positive BigDecimal currentBudget,
		@Min(2000) @Max(2100) int fiscalYear,
		@DecimalMin("-90.000000") @DecimalMax("90.000000") BigDecimal latitude,
		@DecimalMin("-180.000000") @DecimalMax("180.000000") BigDecimal longitude
		) {
	@JsonCreator
	public DepartmentRequest {
		if ((latitude == null) != (longitude == null)) {
			throw new IllegalArgumentException("Both latitude and longitude must be provided together or not at all");
		}
	}
		}
