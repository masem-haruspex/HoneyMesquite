package org.mm.FinanceTracker.Documents;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@Data
@Builder
public class DocumentUploadRequest {
    private String entityType;
    private Long entityId;
    private String documentType;
    private String confidentiality;
    private Instant expiryDate;
    private Map<String, Object> metadata;
    private List<TagRequest> tags;
    private Document.StorageType storageType;
    private boolean allowDuplicates;

    public boolean isValid() {
        return entityType != null && entityId != null && 
               documentType != null && !documentType.isEmpty();
    }
}
