package org.mm.FinanceTracker.Documents;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import java.io.ByteArrayInputStream;
import java.security.DigestOutputStream;
import java.io.OutputStream;
import java.io.IOException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.util.Base64;
import java.util.Optional;
import java.util.Set;
import java.io.InputStream;

@Slf4j
@Service
@RequiredArgsConstructor
public class DocumentService {

	private final DocumentRepository documentRepository;
	private final DocumentContentRepository contentRepository;
	private final DocumentVersionRepository versionRepository;

	@Value("${document.max-file-size:10485760}") 
	private long maxFileSize;

	@Transactional
public Document uploadDocument(MultipartFile file, DocumentUploadRequest request) {
    validateFile(file);

    try {
        String checksum = computeChecksum(file.getInputStream());
        if (!request.isAllowDuplicates() &&
            documentRepository.findByChecksum(checksum).isPresent()) {
            throw new DuplicateDocumentException("Duplicate content");
        }

        Document doc = createDocument(file, request, checksum);
        doc = documentRepository.save(doc);

        DocumentContent content = DocumentContent.builder()
                .document(doc)
                .content(file.getInputStream().readAllBytes())
                .build();
        contentRepository.save(content);

        createInitialVersion(doc, content.getContent());
        log.info("Document {} uploaded", doc.getId());
        return doc;
    } catch (IOException e) {
        throw new DocumentStorageException("Failed to read uploaded file", e);
    }
}

@Transactional
public Document updateDocument(Long documentId, MultipartFile file, String changeNotes) {
    Document doc = documentRepository.findByIdForUpdate(documentId)
            .orElseThrow(() -> new DocumentNotFoundException("Bad id " + documentId));

    validateFile(file);

    try {
        byte[] newBytes = file.getInputStream().readAllBytes();
        String newChecksum = computeChecksum(new ByteArrayInputStream(newBytes));

        DocumentVersion v = DocumentVersion.builder()
                .document(doc)
                .versionNumber(doc.getVersions().size() + 1)
                .fileName(file.getOriginalFilename())
                .fileSize(file.getSize())
                .checksum(newChecksum)
                .storagePath(Base64.getEncoder().encodeToString(newBytes))
                .changeNotes(changeNotes)
                .createdBy(getCurrentUser())
                .build();
        versionRepository.save(v);

        doc.setFileName(file.getOriginalFilename());
        doc.setFileSize(file.getSize());
        doc.setChecksum(newChecksum);
        doc.setLastModifiedBy(getCurrentUser());
        doc.setLastModifiedAt(Instant.now());

        DocumentContent content = contentRepository.findById(doc.getId()).orElseThrow();
        content.setContent(newBytes);
        return doc;
    } catch (IOException e) {
        throw new DocumentStorageException("Failed to read uploaded file", e);
    }
}

	public byte[] downloadDocument(Long id) {
		Document d = documentRepository.findById(id)
			.orElseThrow(() -> new DocumentNotFoundException("Bad id " + id));
		if (d.isDeleted()) throw new DocumentNotFoundException("Deleted");
		DocumentContent c = contentRepository.findById(id)
			.orElseThrow(() -> new DocumentStorageException("No content", null));
		return c.getContent();
	}

	/* ---------- helper ---------- */
	private String computeChecksum(InputStream in) {
    try {
        MessageDigest md = MessageDigest.getInstance("SHA-256");
        in.transferTo(new DigestOutputStream(OutputStream.nullOutputStream(), md));
        return Base64.getEncoder().encodeToString(md.digest());
    } catch (NoSuchAlgorithmException | IOException e) {
        throw new RuntimeException("Checksum computation failed", e);
    }
}

	private void validateFile(MultipartFile f) {
		if (f.isEmpty()) throw new IllegalArgumentException("Empty file");
		if (f.getSize() > maxFileSize)
			throw new IllegalArgumentException("File too large");
		if (!ALLOWED_TYPES.contains(f.getContentType()))
			throw new IllegalArgumentException("Content type not allowed");
	}

	private static final Set<String> ALLOWED_TYPES = Set.of(
			"application/pdf",
			"image/jpeg", "image/jpg", "image/png",
			"application/msword",
			"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
			"application/vnd.ms-excel",
			"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");

	private String getCurrentUser() {
		return "system";
	}

	public Page<Document> searchDocuments(DocumentSearchCriteria criteria, Pageable pageable) {
		return documentRepository.searchDocuments(
				criteria.getEntityType(),
				criteria.getDocumentType(),
				criteria.getStatus(),
				criteria.getUploadedBy(),
				criteria.getTag(),
				criteria.getStartDate(),
				criteria.getEndDate(),
				pageable
				);
	}

	@Transactional
	public void deleteDocument(Long documentId, String reason) {
		Document document = documentRepository.findById(documentId)
			.orElseThrow(() -> new DocumentNotFoundException("Document not found: " + documentId));

		document.setDeleted(true);
		document.setDeletedAt(Instant.now());
		document.setDeletedBy(getCurrentUser());
		document.setStatus(Document.DocumentStatus.ARCHIVED);

		documentRepository.save(document);
		log.info("Document {} marked as deleted by {}. Reason: {}",
				documentId, getCurrentUser(), reason);
	}

	public java.util.List<Document> findExpiringDocuments(Instant cutoffDate) {
		return documentRepository.findExpiredDocuments(cutoffDate);
	}

	private boolean isAllowedContentType(String contentType) {
		Set<String> allowedTypes = Set.of(
				"application/pdf",
				"image/jpeg", "image/jpg", "image/png",
				"application/msword",
				"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
				"application/vnd.ms-excel",
				"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
				);
		return allowedTypes.contains(contentType);
	}

	private String calculateChecksum(byte[] content) {
		try {
			MessageDigest digest = MessageDigest.getInstance("SHA-256");
			byte[] hash = digest.digest(content);
			return Base64.getEncoder().encodeToString(hash);
		} catch (NoSuchAlgorithmException e) {
			throw new RuntimeException("SHA-256 algorithm not available", e);
		}
	}

	private Document createDocument(MultipartFile file, DocumentUploadRequest request, String checksum) {
		Document document = new Document();
		document.setFileName(file.getOriginalFilename());
		document.setFileSize(file.getSize());
		document.setMimeType(file.getContentType());
		document.setChecksum(checksum);
		document.setStorageType(Document.StorageType.DB);
		document.setEntityType(request.getEntityType());
		document.setEntityId(request.getEntityId());
		document.setDocumentType(request.getDocumentType());
		document.setConfidentiality(request.getConfidentiality());
		document.setExpiryDate(request.getExpiryDate());
		document.setMetadata(request.getMetadata());
		document.setStatus(Document.DocumentStatus.ACTIVE);
		document.setUploadedBy(getCurrentUser());
		document.setUploadedAt(Instant.now());

		if (request.getTags() != null) {
			request.getTags().forEach(tag -> {
				DocumentTag docTag = DocumentTag.builder()
					.tagName(tag.getName())
					.tagCategory(tag.getCategory())
					.createdBy(getCurrentUser())
					.build();
				document.addTag(docTag);
			});
		}

		return document;
	}

	private void createInitialVersion(Document document, byte[] content) {
    DocumentVersion version = DocumentVersion.builder()
        .document(document)
        .versionNumber(1)
        .fileName(document.getFileName())
        .fileSize(document.getFileSize())
        .checksum(document.getChecksum())
        .storagePath(java.util.Base64.getEncoder().encodeToString(content))
        .changeNotes("Initial version")
        .createdBy(getCurrentUser())
        .build();

    document.addVersion(version);
    versionRepository.save(version);
}

	public Document getDocumentById(Long id) {
		return documentRepository.findById(id)
			.orElseThrow(() -> new DocumentNotFoundException("Document not found: " + id));
	}

	public java.util.List<Document> getDocumentsByEntity(String entityType, Long entityId) {
		return documentRepository.findAllActiveByEntity(entityType, entityId);
	}
}
