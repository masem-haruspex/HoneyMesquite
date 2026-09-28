package org.mm.FinanceTracker.Documents;

import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import jakarta.persistence.LockModeType;
import java.util.Optional;

@Repository
public interface DocumentContentRepository extends JpaRepository<DocumentContent, Long> {
}

