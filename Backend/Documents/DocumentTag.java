package org.mm.FinanceTracker.Documents;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

@Entity
@Table(name = "document_tags",
       uniqueConstraints = @UniqueConstraint(columnNames = {"document_id", "tag_name"}))
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class DocumentTag {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "document_id", nullable = false)
    private Document document;

    @Column(name = "tag_name", nullable = false, length = 100)
    private String tagName;

    @Column(length = 50)
    private String tagCategory;  // DEPARTMENT, PROJECT, TYPE, etc.

    private Instant createdAt;

    @Column(length = 120)
    private String createdBy;

    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
    }
}
