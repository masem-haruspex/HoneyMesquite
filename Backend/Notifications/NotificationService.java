package org.mm.FinanceTracker.Notifications;

import org.mm.FinanceTracker.Notifications.dto.NotificationDTO;
import org.mm.FinanceTracker.Notifications.dto.NotificationPreferenceDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private NotificationPreferenceRepository preferenceRepository;

    public Page<NotificationDTO> getUserNotifications(Long userId, Pageable pageable) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable)
                .map(this::convertToDTO);
    }

    public List<NotificationDTO> getUnreadNotifications(Long userId) {
        return notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<NotificationDTO> getUnreadHighPriorityNotifications(Long userId, Integer priorityThreshold) {
        return notificationRepository
                .findByUserIdAndIsReadFalseAndPriorityGreaterThanEqualOrderByCreatedAtDesc(userId, priorityThreshold)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public Long getUnreadNotificationCount(Long userId) {
        return notificationRepository.countUnreadByUserId(userId);
    }

    public Long getUnreadHighPriorityNotificationCount(Long userId, Integer priorityThreshold) {
        return notificationRepository.countUnreadByUserIdAndPriorityGreaterThanEqual(userId, priorityThreshold);
    }

    @Transactional
    public NotificationDTO createNotification(NotificationDTO notificationDTO) {
        Notification notification = convertToEntity(notificationDTO);
        notification.setCreatedAt(LocalDateTime.now());
        Notification savedNotification = notificationRepository.save(notification);
        return convertToDTO(savedNotification);
    }

    @Transactional
    public NotificationDTO markAsRead(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found with id: " + notificationId));
        notification.setIsRead(true);
        notification.setReadAt(LocalDateTime.now());
        Notification updatedNotification = notificationRepository.save(notification);
        return convertToDTO(updatedNotification);
    }

    @Transactional
    public void markAllAsRead(Long userId) {
        List<Notification> notifications = notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId);
        for (Notification notification : notifications) {
            notification.setIsRead(true);
            notification.setReadAt(LocalDateTime.now());
        }
        notificationRepository.saveAll(notifications);
    }

    @Transactional
    public void deleteNotification(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found with id: " + notificationId));
        notificationRepository.delete(notification);
    }

    @Transactional
    public void deleteAllNotifications(Long userId) {
        List<Notification> notifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, Pageable.unpaged()).getContent();
        notificationRepository.deleteAll(notifications);
    }

    public List<NotificationPreferenceDTO> getUserPreferences(Long userId) {
        return preferenceRepository.findByUserId(userId)
                .stream()
                .map(this::convertPreferenceToDTO)
                .collect(Collectors.toList());
    }

    public NotificationPreferenceDTO getUserPreference(Long userId, String notificationType, String channel) {
        return preferenceRepository.findByUserIdAndNotificationTypeAndChannel(userId, notificationType, channel)
                .map(this::convertPreferenceToDTO)
                .orElse(null);
    }

    @Transactional
    public NotificationPreferenceDTO createOrUpdatePreference(NotificationPreferenceDTO preferenceDTO) {
        java.util.Optional<NotificationPreference> existingPreference = preferenceRepository
                .findByUserIdAndNotificationTypeAndChannel(
                        preferenceDTO.getUserId(),
                        preferenceDTO.getNotificationType(),
                        preferenceDTO.getChannel());

        NotificationPreference preference;
        if (existingPreference.isPresent()) {
            preference = existingPreference.get();
            preference.setIsEnabled(preferenceDTO.getIsEnabled());
            preference.setUpdatedAt(LocalDateTime.now());
        } else {
            preference = convertPreferenceToEntity(preferenceDTO);
            preference.setCreatedAt(LocalDateTime.now());
            preference.setUpdatedAt(LocalDateTime.now());
        }

        NotificationPreference savedPreference = preferenceRepository.save(preference);
        return convertPreferenceToDTO(savedPreference);
    }

    @Transactional
    public void deletePreference(Long preferenceId) {
        NotificationPreference preference = preferenceRepository.findById(preferenceId)
                .orElseThrow(() -> new RuntimeException("Preference not found with id: " + preferenceId));
        preferenceRepository.delete(preference);
    }

    private NotificationDTO convertToDTO(Notification notification) {
        NotificationDTO dto = new NotificationDTO();
        dto.setId(notification.getId());
        dto.setUserId(notification.getUserId());
        dto.setTitle(notification.getTitle());
        dto.setMessage(notification.getMessage());
        dto.setType(notification.getType());
        dto.setPriority(notification.getPriority());
        dto.setIsRead(notification.getIsRead());
        dto.setRelatedEntityType(notification.getRelatedEntityType());
        dto.setRelatedEntityId(notification.getRelatedEntityId());
        dto.setActionUrl(notification.getActionUrl());
        dto.setCreatedAt(notification.getCreatedAt());
        dto.setReadAt(notification.getReadAt());
        return dto;
    }

    private Notification convertToEntity(NotificationDTO dto) {
        Notification notification = new Notification();
        notification.setId(dto.getId());
        notification.setUserId(dto.getUserId());
        notification.setTitle(dto.getTitle());
        notification.setMessage(dto.getMessage());
        notification.setType(dto.getType());
        notification.setPriority(dto.getPriority());
        notification.setIsRead(dto.getIsRead());
        notification.setRelatedEntityType(dto.getRelatedEntityType());
        notification.setRelatedEntityId(dto.getRelatedEntityId());
        notification.setActionUrl(dto.getActionUrl());
        notification.setCreatedAt(dto.getCreatedAt());
        notification.setReadAt(dto.getReadAt());
        return notification;
    }

    private NotificationPreferenceDTO convertPreferenceToDTO(NotificationPreference preference) {
        NotificationPreferenceDTO dto = new NotificationPreferenceDTO();
        dto.setId(preference.getId());
        dto.setUserId(preference.getUserId());
        dto.setNotificationType(preference.getNotificationType());
        dto.setChannel(preference.getChannel());
        dto.setIsEnabled(preference.getIsEnabled());
        dto.setCreatedAt(preference.getCreatedAt());
        dto.setUpdatedAt(preference.getUpdatedAt());
        return dto;
    }

    private NotificationPreference convertPreferenceToEntity(NotificationPreferenceDTO dto) {
        NotificationPreference preference = new NotificationPreference();
        preference.setId(dto.getId());
        preference.setUserId(dto.getUserId());
        preference.setNotificationType(dto.getNotificationType());
        preference.setChannel(dto.getChannel());
        preference.setIsEnabled(dto.getIsEnabled());
        preference.setCreatedAt(dto.getCreatedAt());
        preference.setUpdatedAt(dto.getUpdatedAt());
        return preference;
    }
}
