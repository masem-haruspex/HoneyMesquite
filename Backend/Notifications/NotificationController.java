package org.mm.FinanceTracker.Notifications;

import org.mm.FinanceTracker.Notifications.dto.NotificationDTO;
import org.mm.FinanceTracker.Notifications.dto.NotificationPreferenceDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @GetMapping("/")
    public ResponseEntity<Page<NotificationDTO>> getUserNotifications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Long userId = 1L; 
        Page<NotificationDTO> notifications = notificationService.getUserNotifications(userId, pageable);
        return ResponseEntity.ok(notifications);
    }

    @GetMapping("/unread")
    public ResponseEntity<List<NotificationDTO>> getUnreadNotifications() {
        Long userId = 1L; 
        List<NotificationDTO> notifications = notificationService.getUnreadNotifications(userId);
        return ResponseEntity.ok(notifications);
    }

    @GetMapping("/unread/count")
    public ResponseEntity<Long> getUnreadNotificationCount() {
        Long userId = 1L; 
        Long count = notificationService.getUnreadNotificationCount(userId);
        return ResponseEntity.ok(count);
    }

    @PostMapping("/")
    public ResponseEntity<NotificationDTO> createNotification(@RequestBody NotificationDTO notificationDTO) {
        NotificationDTO createdNotification = notificationService.createNotification(notificationDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdNotification);
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<NotificationDTO> markAsRead(@PathVariable Long id) {
        try {
            NotificationDTO notification = notificationService.markAsRead(id);
            return ResponseEntity.ok(notification);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead() {
        Long userId = 1L; 
        notificationService.markAllAsRead(userId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNotification(@PathVariable Long id) {
        try {
            notificationService.deleteNotification(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/all")
    public ResponseEntity<Void> deleteAllNotifications() {
        Long userId = 1L; 
        notificationService.deleteAllNotifications(userId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/preferences")
    public ResponseEntity<List<NotificationPreferenceDTO>> getUserPreferences() {
        Long userId = 1L; 
        List<NotificationPreferenceDTO> preferences = notificationService.getUserPreferences(userId);
        return ResponseEntity.ok(preferences);
    }

    @GetMapping("/preferences/{notificationType}/{channel}")
    public ResponseEntity<NotificationPreferenceDTO> getUserPreference(
            @PathVariable String notificationType,
            @PathVariable String channel) {
        Long userId = 1L; 
        NotificationPreferenceDTO preference = notificationService.getUserPreference(userId, notificationType, channel);
        if (preference != null) {
            return ResponseEntity.ok(preference);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/preferences")
    public ResponseEntity<NotificationPreferenceDTO> createOrUpdatePreference(@RequestBody NotificationPreferenceDTO preferenceDTO) {
        NotificationPreferenceDTO preference = notificationService.createOrUpdatePreference(preferenceDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(preference);
    }

    @DeleteMapping("/preferences/{id}")
    public ResponseEntity<Void> deletePreference(@PathVariable Long id) {
        try {
            notificationService.deletePreference(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
