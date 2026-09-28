package org.mm.FinanceTracker.Documents;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.Map;

@Data
@Builder
public class DocumentSearchRequest {
    private String entityType;
    private String documentType;
    private Document.DocumentStatus status;
    private String uploadedBy;
    private String tag;
    private Instant startDate;
    private Instant endDate;
    private Map<String, Object> metadataFilter;

    public DocumentSearchCriteria toCriteria() {
        return DocumentSearchCriteria.builder()
            .entityType(entityType)
            .documentType(documentType)
            .status(status)
            .uploadedBy(uploadedBy)
            .tag(tag)
            .startDate(startDate)
            .endDate(endDate)
            .metadata(metadataFilter)
            .build();
    }
}
