package org.mm.FinanceTracker.Workflows;

import org.mm.FinanceTracker.Notifications.NotificationSenderService;
import org.mm.FinanceTracker.Notifications.dto.NotificationDTO;
import org.mm.FinanceTracker.Users.User;
import org.mm.FinanceTracker.Users.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Component
public class EscalationScheduler {

    @Autowired
    private ApprovalRequestRepository requestRepository;

    @Autowired
    private ApprovalStepRepository stepRepository;

    @Autowired
    private EscalationPolicyRepository escalationRepository;

    @Autowired
    private UserService userService;

    @Autowired
    private NotificationSenderService notificationSender;

    /**
     * Check for pending approvals that need escalation every hour
     */
    @Scheduled(fixedRate = 3600000) 
    @Transactional
    public void checkForEscalations() {
        List<ApprovalRequest> pendingRequests = requestRepository.findByStatusAndSubmittedAtBefore(
                "PENDING", LocalDateTime.now().minusHours(1));

        for (ApprovalRequest request : pendingRequests) {
            ApprovalStep currentStep = stepRepository.findById(request.getCurrentStepId()).orElse(null);
            if (currentStep != null) {
                EscalationPolicy stepPolicy = escalationRepository.findByStepIdAndIsActiveTrue(currentStep.getId())
                        .orElse(null);

                EscalationPolicy workflowPolicy = null;
                if (stepPolicy == null) {
                    workflowPolicy = escalationRepository.findByWorkflowIdAndIsActiveTrue(request.getWorkflowId())
                            .stream().findFirst().orElse(null);
                }

                EscalationPolicy policy = stepPolicy != null ? stepPolicy : workflowPolicy;

                if (policy != null) {
                    LocalDateTime escalationTime = request.getSubmittedAt().plusHours(policy.getTimeoutHours());
                    if (LocalDateTime.now().isAfter(escalationTime)) {
                        escalateRequest(request, policy);
                    }
                }
            }
        }
    }

    private void escalateRequest(ApprovalRequest request, EscalationPolicy policy) {
        request.setStatus("ESCALATED");
        request.setEscalatedAt(LocalDateTime.now());
        request.setUpdatedAt(LocalDateTime.now());
        requestRepository.save(request);

        Long escalatedToUserId = null;
        if (policy.getEscalationUserId() != null) {
            escalatedToUserId = policy.getEscalationUserId();
        } else if (policy.getEscalationRole() != null) {
            escalatedToUserId = 1L;
        }

        if (escalatedToUserId != null) {
            NotificationDTO notification = new NotificationDTO();
            notification.setUserId(escalatedToUserId);
            notification.setTitle("Escalated Approval Request");
            notification.setMessage(String.format(
                    "Approval request '%s' has been escalated to you", 
                    request.getTitle()));
            notification.setType("WARNING");
            notification.setPriority(3); 
            notification.setRelatedEntityType(request.getEntityType());
            notification.setRelatedEntityId(request.getEntityId());
            notification.setActionUrl(String.format("/approvals/%d", request.getId()));

            notificationSender.sendInAppNotification(notification);
        }

        if (policy.getNotificationRequired()) {
            ApprovalStep currentStep = stepRepository.findById(request.getCurrentStepId()).orElse(null);
            if (currentStep != null && currentStep.getApproverUserId() != null) {
                NotificationDTO notification = new NotificationDTO();
                notification.setUserId(currentStep.getApproverUserId());
                notification.setTitle("Approval Request Escalated");
                notification.setMessage(String.format(
                        "Approval request '%s' has been escalated due to timeout", 
                        request.getTitle()));
                notification.setType("INFO");
                notification.setPriority(2); 
                
                notificationSender.sendInAppNotification(notification);
            }
        }
    }
}
