package org.mm.FinanceTracker.Documents;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Repository
public interface DocumentRepository extends JpaRepository<Document, Long> {

	@Query("SELECT d FROM Document d WHERE d.entityType = :type AND d.entityId = :eId AND d.deleted = false")
	List<Document> findAllActiveByEntity(@Param("type") String type, @Param("eId") Long entityId);

	@Query("SELECT d FROM Document d WHERE d.checksum = :checksum AND d.deleted = false")
	Optional<Document> findByChecksum(@Param("checksum") String checksum);

	@Query("""
	SELECT d FROM Document d
	WHERE d.deleted = false
	AND (:entityType IS NULL OR d.entityType = :entityType)
	AND (:documentType IS NULL OR d.documentType = :documentType)
	AND (:status IS NULL OR d.status = :status)
	AND (:uploadedBy IS NULL OR d.uploadedBy = :uploadedBy)
	AND (:tag IS NULL OR EXISTS (SELECT t FROM DocumentTag t WHERE t.document = d AND t.tagName = :tag))
	AND (:startDate IS NULL OR d.uploadedAt >= :startDate)
	AND (:endDate IS NULL OR d.uploadedAt <= :endDate)
	""")
		Page<Document> searchDocuments(
				@Param("entityType") String entityType,
				@Param("documentType") String documentType,
				@Param("status") Document.DocumentStatus status,
				@Param("uploadedBy") String uploadedBy,
				@Param("tag") String tag,
				@Param("startDate") Instant startDate,
				@Param("endDate") Instant endDate,
				Pageable pageable);

	@Query(value = """
	SELECT * FROM documents d
	WHERE d.deleted = false
	AND d.metadata @> CAST(:jsonFilter as jsonb)
	""", nativeQuery = true)
		List<Document> findByMetadataJson(@Param("jsonFilter") String jsonFilter);

	@Query("SELECT d FROM Document d WHERE d.expiryDate < :now AND d.status = 'ACTIVE'")
	List<Document> findExpiredDocuments(@Param("now") Instant now);

	@Query("SELECT d FROM Document d WHERE d.confidentiality = :level AND d.deleted = false")
	List<Document> findByConfidentiality(@Param("level") String confidentiality);

	@Query("SELECT d FROM Document d WHERE d.id IN :ids AND d.deleted = false")
	List<Document> findAllActiveByIds(@Param("ids") Set<Long> ids);

	@Query("SELECT COUNT(d) FROM Document d WHERE d.deleted = false")
	long countActiveDocuments();

	@Query("SELECT COUNT(d) FROM Document d WHERE d.entityType = :type AND d.deleted = false")
	long countByEntityType(@Param("type") String entityType);

	@Query("SELECT d.entityType, COUNT(d) FROM Document d WHERE d.deleted = false GROUP BY d.entityType")
	List<Object[]> countByEntityTypes();

	@Query("SELECT d FROM Document d WHERE d.storageType = :storageType AND d.deleted = false")
	List<Document> findByStorageType(@Param("storageType") Document.StorageType storageType);

	@org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
	@Query("SELECT d FROM Document d WHERE d.id = :id")
	Optional<Document> findByIdForUpdate(@Param("id") Long id);
}
