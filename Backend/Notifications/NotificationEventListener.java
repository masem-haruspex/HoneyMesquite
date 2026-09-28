package org.mm.FinanceTracker.Notifications;

import org.mm.FinanceTracker.Audit.LogEntry;
import org.mm.FinanceTracker.Notifications.dto.NotificationDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

@Component
public class NotificationEventListener {

    @Autowired
    private NotificationSenderService notificationSender;

    @EventListener
    @Async
    public void handleAuditEvent(LogEntry logEntry) {
        if (logEntry.getOperation() == LogEntry.Operation.DELETE ||
            logEntry.getOperation() == LogEntry.Operation.APPROVE ||
            logEntry.getOperation() == LogEntry.Operation.REJECT) {

            NotificationDTO notification = new NotificationDTO();
            notification.setUserId(1L); 
            notification.setTitle("Critical Action Performed");
            notification.setMessage(String.format(
                "User %s performed %s operation on %s (ID: %s)",
                logEntry.getUserId(),
                logEntry.getOperation(),
                logEntry.getEntityType(),
                logEntry.getEntityId()
            ));
            notification.setType("WARNING");
            notification.setPriority(3); 
            notification.setRelatedEntityType(logEntry.getEntityType());
            notification.setRelatedEntityId(Long.parseLong(logEntry.getEntityId()));

            notificationSender.sendInAppNotification(notification);
        }
    }

    @EventListener
    @Async
    public void handleApprovalEvent(ApprovalEvent event) {
        NotificationDTO notification = new NotificationDTO();
        notification.setUserId(event.getApprovers().get(0)); 
        notification.setTitle("Approval Required");
        notification.setMessage(String.format(
            "Approval required for %s (ID: %d) - Amount: %s",
            event.getEntityType(),
            event.getEntityId(),
            event.getAmount()
        ));
        notification.setType("INFO");
        notification.setPriority(2); 
        notification.setRelatedEntityType(event.getEntityType());
        notification.setRelatedEntityId(event.getEntityId());
        notification.setActionUrl(String.format("/approvals/%d", event.getEntityId()));

        notificationSender.sendInAppNotification(notification);
    }

    public static class ApprovalEvent {
        private String entityType;
        private Long entityId;
        private String amount;
        private java.util.List<Long> approvers;

        public ApprovalEvent(String entityType, Long entityId, String amount, java.util.List<Long> approvers) {
            this.entityType = entityType;
            this.entityId = entityId;
            this.amount = amount;
            this.approvers = approvers;
        }

        public String getEntityType() { return entityType; }
        public Long getEntityId() { return entityId; }
        public String getAmount() { return amount; }
        public java.util.List<Long> getApprovers() { return approvers; }
    }
}
