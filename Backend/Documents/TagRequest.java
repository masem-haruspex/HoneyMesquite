package org.mm.FinanceTracker.Documents;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TagRequest {
    private String name;
    private String category;
}
