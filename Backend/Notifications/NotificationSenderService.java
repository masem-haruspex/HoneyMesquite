package org.mm.FinanceTracker.Notifications;

import org.mm.FinanceTracker.Notifications.dto.NotificationDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class NotificationSenderService {

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private WebSocketController webSocketController;

    @Autowired
    private NotificationService notificationService;

    public void sendInAppNotification(NotificationDTO notificationDTO) {
        NotificationDTO savedNotification = notificationService.createNotification(notificationDTO);

        webSocketController.sendNotificationToUser(savedNotification.getUserId(), savedNotification);
    }

    @Async
    public void sendEmailNotification(String to, String subject, String body) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public void sendNotification(NotificationDTO notificationDTO, String email, String subject) {
        sendInAppNotification(notificationDTO);

        if (email != null && !email.isEmpty()) {
            sendEmailNotification(email, subject, notificationDTO.getMessage());
        }
    }

    public void broadcastNotification(NotificationDTO notificationDTO) {
        NotificationDTO savedNotification = notificationService.createNotification(notificationDTO);

        webSocketController.broadcastNotificationToAll(savedNotification);
    }
}
