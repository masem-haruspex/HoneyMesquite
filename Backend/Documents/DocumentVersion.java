package org.mm.FinanceTracker.Documents;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

@Entity
@Table(name = "document_versions")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class DocumentVersion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "document_id", nullable = false)
    private Document document;

    @Column(nullable = false)
    private Integer versionNumber;

    @Column(nullable = false)
    private String fileName;

    @Column(nullable = false)
    private Long fileSize;

    @Column(nullable = false)
    private String checksum;

    @Column(nullable = false)
    private String storagePath;

    @Column(nullable = false)
    private Instant createdAt;

    @Column(length = 120)
    private String createdBy;

    @Column(columnDefinition = "TEXT")
    private String changeNotes;

    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
    }
}
