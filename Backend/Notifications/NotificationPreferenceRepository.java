package org.mm.FinanceTracker.Notifications;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NotificationPreferenceRepository extends JpaRepository<NotificationPreference, Long> {
    List<NotificationPreference> findByUserId(Long userId);
    
    Optional<NotificationPreference> findByUserIdAndNotificationTypeAndChannel(
        Long userId, String notificationType, String channel);
    
    boolean existsByUserIdAndNotificationTypeAndChannel(
        Long userId, String notificationType, String channel);
}
