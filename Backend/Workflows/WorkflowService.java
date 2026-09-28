package org.mm.FinanceTracker.Workflows;

import org.mm.FinanceTracker.Notifications.NotificationSenderService;
import org.mm.FinanceTracker.Notifications.dto.NotificationDTO;
import org.mm.FinanceTracker.Users.PermissionChecker;
import org.mm.FinanceTracker.Users.User;
import org.mm.FinanceTracker.Users.UserService;
import org.mm.FinanceTracker.Workflows.dto.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class WorkflowService {

    @Autowired
    private ApprovalWorkflowRepository workflowRepository;

    @Autowired
    private ApprovalStepRepository stepRepository;

    @Autowired
    private ApprovalRequestRepository requestRepository;

    @Autowired
    private ApprovalRepository approvalRepository;

    @Autowired
    private EscalationPolicyRepository escalationRepository;

    @Autowired
    private UserService userService;

    @Autowired
    private PermissionChecker permissionChecker;

    @Autowired
    private NotificationSenderService notificationSender;

    public List<ApprovalWorkflowDTO> getAllWorkflows() {
        return workflowRepository.findAll().stream()
                .map(this::convertToWorkflowDTO)
                .collect(Collectors.toList());
    }

    public ApprovalWorkflowDTO getWorkflowById(Long id) {
        return workflowRepository.findById(id)
                .map(this::convertToWorkflowDTO)
                .orElse(null);
    }

    @Transactional
    public ApprovalWorkflowDTO createWorkflow(ApprovalWorkflowDTO workflowDTO) {
        ApprovalWorkflow workflow = convertToWorkflowEntity(workflowDTO);
        workflow.setCreatedAt(LocalDateTime.now());
        workflow.setUpdatedAt(LocalDateTime.now());
        ApprovalWorkflow savedWorkflow = workflowRepository.save(workflow);
        return convertToWorkflowDTO(savedWorkflow);
    }

    @Transactional
    public ApprovalWorkflowDTO updateWorkflow(Long id, ApprovalWorkflowDTO workflowDTO) {
        ApprovalWorkflow workflow = workflowRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Workflow not found with id: " + id));

        workflow.setName(workflowDTO.getName());
        workflow.setDescription(workflowDTO.getDescription());
        workflow.setEntityType(workflowDTO.getEntityType());
        workflow.setIsActive(workflowDTO.getIsActive());
        workflow.setUpdatedAt(LocalDateTime.now());

        ApprovalWorkflow updatedWorkflow = workflowRepository.save(workflow);
        return convertToWorkflowDTO(updatedWorkflow);
    }

    @Transactional
    public void deleteWorkflow(Long id) {
        ApprovalWorkflow workflow = workflowRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Workflow not found with id: " + id));
        workflowRepository.delete(workflow);
    }

    public List<ApprovalStepDTO> getStepsByWorkflowId(Long workflowId) {
        return stepRepository.findByWorkflowIdOrderByStepOrder(workflowId).stream()
                .map(this::convertToStepDTO)
                .collect(Collectors.toList());
    }

    public ApprovalStepDTO getStepById(Long id) {
        return stepRepository.findById(id)
                .map(this::convertToStepDTO)
                .orElse(null);
    }

    @Transactional
    public ApprovalStepDTO createStep(ApprovalStepDTO stepDTO) {
        ApprovalStep step = convertToStepEntity(stepDTO);
        step.setCreatedAt(LocalDateTime.now());
        step.setUpdatedAt(LocalDateTime.now());
        ApprovalStep savedStep = stepRepository.save(step);
        return convertToStepDTO(savedStep);
    }

    @Transactional
    public ApprovalStepDTO updateStep(Long id, ApprovalStepDTO stepDTO) {
        ApprovalStep step = stepRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Step not found with id: " + id));

        step.setWorkflowId(stepDTO.getWorkflowId());
        step.setStepOrder(stepDTO.getStepOrder());
        step.setName(stepDTO.getName());
        step.setDescription(stepDTO.getDescription());
        step.setApproverRole(stepDTO.getApproverRole());
        step.setApproverUserId(stepDTO.getApproverUserId());
        step.setApprovalCondition(stepDTO.getApprovalCondition());
        step.setConditionValue(stepDTO.getConditionValue());
        step.setIsActive(stepDTO.getIsActive());
        step.setUpdatedAt(LocalDateTime.now());

        ApprovalStep updatedStep = stepRepository.save(step);
        return convertToStepDTO(updatedStep);
    }

    @Transactional
    public void deleteStep(Long id) {
        ApprovalStep step = stepRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Step not found with id: " + id));
        stepRepository.delete(step);
    }

    public Page<ApprovalRequestDTO> getRequestsByRequester(Long requesterUserId, Pageable pageable) {
        return requestRepository.findByRequesterUserIdOrderBySubmittedAtDesc(requesterUserId, pageable)
                .map(this::convertToRequestDTO);
    }

    public Page<ApprovalRequestDTO> getPendingApprovals(Long approverUserId, Pageable pageable) {
        return requestRepository.findPendingApprovalsByApproverUserId(approverUserId, pageable)
                .map(this::convertToRequestDTO);
    }

    public ApprovalRequestDTO getRequestById(Long id) {
        return requestRepository.findById(id)
                .map(this::convertToRequestDTO)
                .orElse(null);
    }

    @Transactional
    public ApprovalRequestDTO createRequest(ApprovalRequestDTO requestDTO) {
        ApprovalRequest request = convertToRequestEntity(requestDTO);
        request.setSubmittedAt(LocalDateTime.now());
        request.setCreatedAt(LocalDateTime.now());
        request.setUpdatedAt(LocalDateTime.now());

        List<ApprovalStep> steps = stepRepository.findByWorkflowIdAndIsActiveTrueOrderByStepOrder(request.getWorkflowId());
        if (!steps.isEmpty()) {
            request.setCurrentStepId(steps.get(0).getId());
        }

        ApprovalRequest savedRequest = requestRepository.save(request);

        notifyApprovers(savedRequest);

        return convertToRequestDTO(savedRequest);
    }

    @Transactional
    public ApprovalRequestDTO approveRequest(Long requestId, Long approverUserId, String comments) {
        ApprovalRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found with id: " + requestId));

        if (!isAuthorizedApprover(request, approverUserId)) {
            throw new RuntimeException("User is not authorized to approve this request");
        }

        Approval approval = new Approval();
        approval.setRequestId(requestId);
        approval.setStepId(request.getCurrentStepId());
        approval.setApproverUserId(approverUserId);
        approval.setStatus("APPROVED");
        approval.setComments(comments);
        approval.setApprovedAt(LocalDateTime.now());
        approval.setCreatedAt(LocalDateTime.now());
        approval.setUpdatedAt(LocalDateTime.now());
        approvalRepository.save(approval);

        moveToNextStepOrComplete(request);

        ApprovalRequest updatedRequest = requestRepository.save(request);
        return convertToRequestDTO(updatedRequest);
    }

    @Transactional
    public ApprovalRequestDTO rejectRequest(Long requestId, Long approverUserId, String comments) {
        ApprovalRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found with id: " + requestId));

        if (!isAuthorizedApprover(request, approverUserId)) {
            throw new RuntimeException("User is not authorized to reject this request");
        }

        Approval approval = new Approval();
        approval.setRequestId(requestId);
        approval.setStepId(request.getCurrentStepId());
        approval.setApproverUserId(approverUserId);
        approval.setStatus("REJECTED");
        approval.setComments(comments);
        approval.setRejectedAt(LocalDateTime.now());
        approval.setCreatedAt(LocalDateTime.now());
        approval.setUpdatedAt(LocalDateTime.now());
        approvalRepository.save(approval);

        request.setStatus("REJECTED");
        request.setRejectedAt(LocalDateTime.now());
        request.setCompletedAt(LocalDateTime.now());
        request.setUpdatedAt(LocalDateTime.now());

        ApprovalRequest updatedRequest = requestRepository.save(request);

        notifyRequesterOfRejection(updatedRequest);

        return convertToRequestDTO(updatedRequest);
    }

    @Transactional
    public void deleteRequest(Long id) {
        ApprovalRequest request = requestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Request not found with id: " + id));
        requestRepository.delete(request);
    }

    public List<EscalationPolicyDTO> getEscalationPoliciesByWorkflowId(Long workflowId) {
        return escalationRepository.findByWorkflowId(workflowId).stream()
                .map(this::convertToEscalationDTO)
                .collect(Collectors.toList());
    }

    public EscalationPolicyDTO getEscalationPolicyById(Long id) {
        return escalationRepository.findById(id)
                .map(this::convertToEscalationDTO)
                .orElse(null);
    }

    @Transactional
    public EscalationPolicyDTO createEscalationPolicy(EscalationPolicyDTO escalationDTO) {
        EscalationPolicy escalation = convertToEscalationEntity(escalationDTO);
        escalation.setCreatedAt(LocalDateTime.now());
        escalation.setUpdatedAt(LocalDateTime.now());
        EscalationPolicy savedEscalation = escalationRepository.save(escalation);
        return convertToEscalationDTO(savedEscalation);
    }

    @Transactional
    public EscalationPolicyDTO updateEscalationPolicy(Long id, EscalationPolicyDTO escalationDTO) {
        EscalationPolicy escalation = escalationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Escalation policy not found with id: " + id));

        escalation.setWorkflowId(escalationDTO.getWorkflowId());
        escalation.setStepId(escalationDTO.getStepId());
        escalation.setTimeoutHours(escalationDTO.getTimeoutHours());
        escalation.setEscalationRole(escalationDTO.getEscalationRole());
        escalation.setEscalationUserId(escalationDTO.getEscalationUserId());
        escalation.setNotificationRequired(escalationDTO.getNotificationRequired());
        escalation.setIsActive(escalationDTO.getIsActive());
        escalation.setUpdatedAt(LocalDateTime.now());

        EscalationPolicy updatedEscalation = escalationRepository.save(escalation);
        return convertToEscalationDTO(updatedEscalation);
    }

    @Transactional
    public void deleteEscalationPolicy(Long id) {
        EscalationPolicy escalation = escalationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Escalation policy not found with id: " + id));
        escalationRepository.delete(escalation);
    }

    private boolean isAuthorizedApprover(ApprovalRequest request, Long approverUserId) {
        ApprovalStep currentStep = stepRepository.findById(request.getCurrentStepId())
                .orElseThrow(() -> new RuntimeException("Current step not found"));

        if (currentStep.getApproverUserId() != null && currentStep.getApproverUserId().equals(approverUserId)) {
            return true;
        }

        if (currentStep.getApproverRole() != null) {
			User user = userService.findEntityById(approverUserId).orElse(null);
            if (user != null && permissionChecker.hasRole(user, currentStep.getApproverRole())) {
                return true;
            }
        }

        return false;
    }

    private void moveToNextStepOrComplete(ApprovalRequest request) {
        List<ApprovalStep> steps = stepRepository.findByWorkflowIdAndIsActiveTrueOrderByStepOrder(request.getWorkflowId());
        ApprovalStep currentStep = stepRepository.findById(request.getCurrentStepId()).orElse(null);

        if (currentStep != null) {
            boolean foundCurrent = false;
            ApprovalStep nextStep = null;

            for (ApprovalStep step : steps) {
                if (foundCurrent) {
                    nextStep = step;
                    break;
                }
                if (step.getId().equals(currentStep.getId())) {
                    foundCurrent = true;
                }
            }

            if (nextStep != null) {
                request.setCurrentStepId(nextStep.getId());
            } else {
                request.setStatus("APPROVED");
                request.setApprovedAt(LocalDateTime.now());
                request.setCompletedAt(LocalDateTime.now());
                
                notifyRequesterOfApproval(request);
            }
        }
    }

    private void notifyApprovers(ApprovalRequest request) {
        ApprovalStep currentStep = stepRepository.findById(request.getCurrentStepId()).orElse(null);
        if (currentStep != null) {
            NotificationDTO notification = new NotificationDTO();
            notification.setUserId(currentStep.getApproverUserId());
            notification.setTitle("Approval Request");
            notification.setMessage(String.format("New approval request: %s", request.getTitle()));
            notification.setType("INFO");
            notification.setPriority(request.getPriority());
            notification.setRelatedEntityType(request.getEntityType());
            notification.setRelatedEntityId(request.getEntityId());
            notification.setActionUrl(String.format("/approvals/%d", request.getId()));

            notificationSender.sendInAppNotification(notification);
        }
    }

    private void notifyRequesterOfApproval(ApprovalRequest request) {
        NotificationDTO notification = new NotificationDTO();
        notification.setUserId(request.getRequesterUserId());
        notification.setTitle("Request Approved");
        notification.setMessage(String.format("Your request '%s' has been approved", request.getTitle()));
        notification.setType("SUCCESS");
        notification.setPriority(1);
        notification.setRelatedEntityType(request.getEntityType());
        notification.setRelatedEntityId(request.getEntityId());

        notificationSender.sendInAppNotification(notification);
    }

    private void notifyRequesterOfRejection(ApprovalRequest request) {
        NotificationDTO notification = new NotificationDTO();
        notification.setUserId(request.getRequesterUserId());
        notification.setTitle("Request Rejected");
        notification.setMessage(String.format("Your request '%s' has been rejected", request.getTitle()));
        notification.setType("WARNING");
        notification.setPriority(2);
        notification.setRelatedEntityType(request.getEntityType());
        notification.setRelatedEntityId(request.getEntityId());

        notificationSender.sendInAppNotification(notification);
    }

    private ApprovalWorkflowDTO convertToWorkflowDTO(ApprovalWorkflow workflow) {
        ApprovalWorkflowDTO dto = new ApprovalWorkflowDTO();
        dto.setId(workflow.getId());
        dto.setName(workflow.getName());
        dto.setDescription(workflow.getDescription());
        dto.setEntityType(workflow.getEntityType());
        dto.setIsActive(workflow.getIsActive());
        dto.setCreatedBy(workflow.getCreatedBy());
        dto.setCreatedAt(workflow.getCreatedAt());
        dto.setUpdatedAt(workflow.getUpdatedAt());
        return dto;
    }

    private ApprovalWorkflow convertToWorkflowEntity(ApprovalWorkflowDTO dto) {
        ApprovalWorkflow workflow = new ApprovalWorkflow();
        workflow.setId(dto.getId());
        workflow.setName(dto.getName());
        workflow.setDescription(dto.getDescription());
        workflow.setEntityType(dto.getEntityType());
        workflow.setIsActive(dto.getIsActive());
        workflow.setCreatedBy(dto.getCreatedBy());
        workflow.setCreatedAt(dto.getCreatedAt());
        workflow.setUpdatedAt(dto.getUpdatedAt());
        return workflow;
    }

    private ApprovalStepDTO convertToStepDTO(ApprovalStep step) {
        ApprovalStepDTO dto = new ApprovalStepDTO();
        dto.setId(step.getId());
        dto.setWorkflowId(step.getWorkflowId());
        dto.setStepOrder(step.getStepOrder());
        dto.setName(step.getName());
        dto.setDescription(step.getDescription());
        dto.setApproverRole(step.getApproverRole());
        dto.setApproverUserId(step.getApproverUserId());
        dto.setApprovalCondition(step.getApprovalCondition());
        dto.setConditionValue(step.getConditionValue());
        dto.setIsActive(step.getIsActive());
        dto.setCreatedAt(step.getCreatedAt());
        dto.setUpdatedAt(step.getUpdatedAt());
        return dto;
    }

    private ApprovalStep convertToStepEntity(ApprovalStepDTO dto) {
        ApprovalStep step = new ApprovalStep();
        step.setId(dto.getId());
        step.setWorkflowId(dto.getWorkflowId());
        step.setStepOrder(dto.getStepOrder());
        step.setName(dto.getName());
        step.setDescription(dto.getDescription());
        step.setApproverRole(dto.getApproverRole());
        step.setApproverUserId(dto.getApproverUserId());
        step.setApprovalCondition(dto.getApprovalCondition());
        step.setConditionValue(dto.getConditionValue());
        step.setIsActive(dto.getIsActive());
        step.setCreatedAt(dto.getCreatedAt());
        step.setUpdatedAt(dto.getUpdatedAt());
        return step;
    }

    private ApprovalRequestDTO convertToRequestDTO(ApprovalRequest request) {
        ApprovalRequestDTO dto = new ApprovalRequestDTO();
        dto.setId(request.getId());
        dto.setEntityId(request.getEntityId());
        dto.setEntityType(request.getEntityType());
        dto.setWorkflowId(request.getWorkflowId());
        dto.setCurrentStepId(request.getCurrentStepId());
        dto.setRequesterUserId(request.getRequesterUserId());
        dto.setTitle(request.getTitle());
        dto.setDescription(request.getDescription());
        dto.setAmount(request.getAmount());
        dto.setCurrency(request.getCurrency());
        dto.setDepartmentId(request.getDepartmentId());
        dto.setStatus(request.getStatus());
        dto.setPriority(request.getPriority());
        dto.setSubmittedAt(request.getSubmittedAt());
        dto.setApprovedAt(request.getApprovedAt());
        dto.setRejectedAt(request.getRejectedAt());
        dto.setEscalatedAt(request.getEscalatedAt());
        dto.setCompletedAt(request.getCompletedAt());
        dto.setNotes(request.getNotes());
        dto.setCreatedAt(request.getCreatedAt());
        dto.setUpdatedAt(request.getUpdatedAt());
        return dto;
    }

    private ApprovalRequest convertToRequestEntity(ApprovalRequestDTO dto) {
        ApprovalRequest request = new ApprovalRequest();
        request.setId(dto.getId());
        request.setEntityId(dto.getEntityId());
        request.setEntityType(dto.getEntityType());
        request.setWorkflowId(dto.getWorkflowId());
        request.setCurrentStepId(dto.getCurrentStepId());
        request.setRequesterUserId(dto.getRequesterUserId());
        request.setTitle(dto.getTitle());
        request.setDescription(dto.getDescription());
        request.setAmount(dto.getAmount());
        request.setCurrency(dto.getCurrency());
        request.setDepartmentId(dto.getDepartmentId());
        request.setStatus(dto.getStatus());
        request.setPriority(dto.getPriority());
        request.setSubmittedAt(dto.getSubmittedAt());
        request.setApprovedAt(dto.getApprovedAt());
        request.setRejectedAt(dto.getRejectedAt());
        request.setEscalatedAt(dto.getEscalatedAt());
        request.setCompletedAt(dto.getCompletedAt());
        request.setNotes(dto.getNotes());
        request.setCreatedAt(dto.getCreatedAt());
        request.setUpdatedAt(dto.getUpdatedAt());
        return request;
    }

    private EscalationPolicyDTO convertToEscalationDTO(EscalationPolicy escalation) {
        EscalationPolicyDTO dto = new EscalationPolicyDTO();
        dto.setId(escalation.getId());
        dto.setWorkflowId(escalation.getWorkflowId());
        dto.setStepId(escalation.getStepId());
        dto.setTimeoutHours(escalation.getTimeoutHours());
        dto.setEscalationRole(escalation.getEscalationRole());
        dto.setEscalationUserId(escalation.getEscalationUserId());
        dto.setNotificationRequired(escalation.getNotificationRequired());
        dto.setIsActive(escalation.getIsActive());
        dto.setCreatedAt(escalation.getCreatedAt());
        dto.setUpdatedAt(escalation.getUpdatedAt());
        return dto;
    }

    private EscalationPolicy convertToEscalationEntity(EscalationPolicyDTO dto) {
        EscalationPolicy escalation = new EscalationPolicy();
        escalation.setId(dto.getId());
        escalation.setWorkflowId(dto.getWorkflowId());
        escalation.setStepId(dto.getStepId());
        escalation.setTimeoutHours(dto.getTimeoutHours());
        escalation.setEscalationRole(dto.getEscalationRole());
        escalation.setEscalationUserId(dto.getEscalationUserId());
        escalation.setNotificationRequired(dto.getNotificationRequired());
        escalation.setIsActive(dto.getIsActive());
        escalation.setCreatedAt(dto.getCreatedAt());
        escalation.setUpdatedAt(dto.getUpdatedAt());
        return escalation;
    }
}
