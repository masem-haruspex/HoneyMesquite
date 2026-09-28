package org.mm.FinanceTracker.Documents;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.mm.FinanceTracker.Documents.DocumentUploadResponse;

import jakarta.validation.Valid;
import java.util.List;
import java.time.Instant;

@Slf4j
@RestController
@RequestMapping("/api/documents")
@RequiredArgsConstructor
public class DocumentController {

	private final DocumentService documentService;

	@PostMapping("/upload")
	public ResponseEntity<DocumentUploadResponse> uploadDocument(
			@RequestParam("file") MultipartFile file,
			@Valid @ModelAttribute DocumentUploadRequest request) {

			Document document = documentService.uploadDocument(file, request);

			DocumentUploadResponse response = new DocumentUploadResponse(
					document.getId(),
					document.getFileName(),
					document.getMimeType(),
					document.getFileSize(),
					document.getDocumentType(),
					document.getEntityType(),
					document.getEntityId(),
					document.getUploadedAt(),
					document.getUploadedBy()
					);

			return ResponseEntity.ok(response);
			}

	@GetMapping("/{id}")
	public ResponseEntity<Document> getDocument(@PathVariable Long id) {
		Document document = documentService.getDocumentById(id);
		return ResponseEntity.ok(document);
	}

	@GetMapping("/{id}/download")
	public ResponseEntity<Resource> downloadDocument(@PathVariable Long id) {
		byte[] content = documentService.downloadDocument(id);

		Document document = documentService.getDocumentById(id);

		ByteArrayResource resource = new ByteArrayResource(content);

		return ResponseEntity.ok()
			.contentType(MediaType.parseMediaType(document.getMimeType()))
			.header(HttpHeaders.CONTENT_DISPOSITION, 
					"attachment; filename=\"" + document.getFileName() + "\"")
			.body(resource);
	}

	@PutMapping("/{id}")
	public ResponseEntity<Document> updateDocument(
			@PathVariable Long id,
			@RequestParam("file") MultipartFile file,
			@RequestParam(required = false) String changeNotes) {

			Document updated = documentService.updateDocument(id, file, changeNotes);
			return ResponseEntity.ok(updated);
			}

	@DeleteMapping("/{id}")
	public ResponseEntity<Void> deleteDocument(
			@PathVariable Long id,
			@RequestParam(required = false) String reason) {

			documentService.deleteDocument(id, reason != null ? reason : "User requested deletion");
			return ResponseEntity.noContent().build();
			}

	@PostMapping("/search")
	public ResponseEntity<Page<Document>> searchDocuments(
			@Valid @RequestBody DocumentSearchRequest request,
			Pageable pageable) {

		Page<Document> results = documentService.searchDocuments(
				request.toCriteria(), pageable);
		return ResponseEntity.ok(results);
			}

	@GetMapping("/entity/{entityType}/{entityId}")
	public ResponseEntity<List<Document>> getDocumentsByEntity(
			@PathVariable String entityType,
			@PathVariable Long entityId) {

			List<Document> documents = documentService.getDocumentsByEntity(entityType, entityId);
			return ResponseEntity.ok(documents);
			}

	@GetMapping("/expiring")
	public ResponseEntity<List<Document>> getExpiringDocuments(
			@RequestParam(defaultValue = "30") int days) {

			Instant cutoffDate = Instant.now().plusSeconds(days * 24 * 60 * 60);
			List<Document> documents = documentService.findExpiringDocuments(cutoffDate);
			return ResponseEntity.ok(documents);
			}
}
