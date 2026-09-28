package org.mm.FinanceTracker.Notifications;

import org.mm.FinanceTracker.Notifications.dto.NotificationDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
public class WebSocketController {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/notify")
    public void sendNotification(@Payload NotificationDTO notificationDTO) {
        messagingTemplate.convertAndSendToUser(
                String.valueOf(notificationDTO.getUserId()),
                "/queue/notifications",
                notificationDTO
        );
    }

    @MessageMapping("/broadcast")
    public void broadcastNotification(@Payload NotificationDTO notificationDTO) {
        messagingTemplate.convertAndSend("/topic/notifications", notificationDTO);
    }

    public void sendNotificationToUser(Long userId, NotificationDTO notificationDTO) {
        messagingTemplate.convertAndSendToUser(
                String.valueOf(userId),
                "/queue/notifications",
                notificationDTO
        );
    }

    public void broadcastNotificationToAll(NotificationDTO notificationDTO) {
        messagingTemplate.convertAndSend("/topic/notifications", notificationDTO);
    }
}
