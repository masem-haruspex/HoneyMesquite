package org.mm.FinanceTracker.Documents;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "document_contents")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class DocumentContent {

    @Id
    private Long documentId;

    @MapsId
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "document_id")
    private Document document;

    @Column(nullable = false, columnDefinition = "bytea")
    private byte[] content;
}
