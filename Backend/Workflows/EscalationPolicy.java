package org.mm.FinanceTracker.Workflows;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "escalation_policies")
public class EscalationPolicy {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "workflow_id", nullable = false)
    private Long workflowId;

    @Column(name = "step_id")
    private Long stepId;

    @Column(name = "timeout_hours", nullable = false)
    private Integer timeoutHours;

    @Column(name = "escalation_role", length = 50)
    private String escalationRole;

    @Column(name = "escalation_user_id")
    private Long escalationUserId;

    @Column(name = "notification_required", nullable = false)
    private Boolean notificationRequired = true;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    // Constructors
    public EscalationPolicy() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

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

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}