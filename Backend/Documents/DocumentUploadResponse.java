package org.mm.FinanceTracker.Documents;

import com.fasterxml.jackson.annotation.JsonCreator;
import java.time.Instant;

public record DocumentUploadResponse(
    Long id,
    String fileName,
    String mimeType,
    Long fileSize,
    String documentType,
    String entityType,
    Long entityId,
    Instant uploadedAt,
    String uploadedBy
) {
    @JsonCreator
    public DocumentUploadResponse {}
}
