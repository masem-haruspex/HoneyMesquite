package org.mm.FinanceTracker.Workflows.dto;

import java.time.LocalDateTime;

public class EscalationPolicyDTO {
    private Long id;
    private Long workflowId;
    private Long stepId;
    private Integer timeoutHours;
    private String escalationRole;
    private Long escalationUserId;
    private Boolean notificationRequired;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Constructors
    public EscalationPolicyDTO() {}

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getWorkflowId() {
        return workflowId;
    }

    public void setWorkflowId(Long workflowId) {
        this.workflowId = workflowId;
    }

    public Long getStepId() {
        return stepId;
    }

    public void setStepId(Long stepId) {
        this.stepId = stepId;
    }

    public Integer getTimeoutHours() {
        return timeoutHours;
    }

    public void setTimeoutHours(Integer timeoutHours) {
        this.timeoutHours = timeoutHours;
    }

    public String getEscalationRole() {
        return escalationRole;
    }

    public void setEscalationRole(String escalationRole) {
        this.escalationRole = escalationRole;
    }

    public Long getEscalationUserId() {
        return escalationUserId;
    }

    public void setEscalationUserId(Long escalationUserId) {
        this.escalationUserId = escalationUserId;
    }

    public Boolean getNotificationRequired() {
        return notificationRequired;
    }

    public void setNotificationRequired(Boolean notificationRequired) {
        this.notificationRequired = notificationRequired;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}