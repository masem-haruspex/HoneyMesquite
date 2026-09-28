package org.mm.FinanceTracker.Documents;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;
import java.util.Map;
import java.util.Set;

@Entity
@Table(name = "documents",
       indexes = {
           @Index(name = "idx_documents_entity", columnList = "entity_type, entity_id"),
           @Index(name = "idx_documents_checksum", columnList = "checksum"),
           @Index(name = "idx_documents_uploaded_at", columnList = "uploaded_at"),
           @Index(name = "idx_documents_deleted", columnList = "deleted")
       })
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class Document {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String fileName;

    @Column(nullable = false)
    private Long fileSize;

    @Column(nullable = false)
    private String mimeType;

    @Column(nullable = false, length = 64)
    private String checksum;          

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private StorageType storageType;

    private String storagePath;       

    @Column(nullable = false, length = 60)
    private String entityType;        

    @Column(nullable = false)
    private Long entityId;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private Map<String, Object> metadata;

    @CreatedBy
    @Column(length = 120)
    private String uploadedBy;

    @CreatedDate
    private Instant uploadedAt;

    @LastModifiedBy
    @Column(length = 120)
    private String lastModifiedBy;

    @LastModifiedDate
    private Instant lastModifiedAt;

    private boolean deleted;

    private Instant deletedAt;

    @Column(length = 120)
    private String deletedBy;

    @Version
    private Long version;

    @OneToMany(mappedBy = "document", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private Set<DocumentVersion> versions = new java.util.HashSet<>();

    @OneToMany(mappedBy = "document", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private Set<DocumentTag> tags = new java.util.HashSet<>();

    @Enumerated(EnumType.STRING)
    @Column(length = 50)
    private DocumentStatus status = DocumentStatus.ACTIVE;

    @Column(length = 20)
    private String documentType;     

    private Instant expiryDate;      

    @Column(length = 50)
    private String confidentiality;  

    public enum StorageType { DB, S3, LOCAL }
    public enum DocumentStatus { ACTIVE, ARCHIVED, EXPIRED, PENDING_REVIEW }

    public boolean isExpired() {
        return expiryDate != null && Instant.now().isAfter(expiryDate);
    }

    public boolean isStorageExternal() {
        return storageType != StorageType.DB;
    }

    public void addVersion(DocumentVersion version) {
        versions.add(version);
        version.setDocument(this);
    }

    public void addTag(DocumentTag tag) {
        tags.add(tag);
        tag.setDocument(this);
    }
}
