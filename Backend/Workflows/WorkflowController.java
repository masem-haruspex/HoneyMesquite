package org.mm.FinanceTracker.Workflows;

import org.mm.FinanceTracker.Workflows.dto.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/workflows")
public class WorkflowController {

    @Autowired
    private WorkflowService workflowService;

    @GetMapping("/workflows")
    public ResponseEntity<List<ApprovalWorkflowDTO>> getAllWorkflows() {
        List<ApprovalWorkflowDTO> workflows = workflowService.getAllWorkflows();
        return ResponseEntity.ok(workflows);
    }

    @GetMapping("/workflows/{id}")
    public ResponseEntity<ApprovalWorkflowDTO> getWorkflowById(@PathVariable Long id) {
        ApprovalWorkflowDTO workflow = workflowService.getWorkflowById(id);
        if (workflow != null) {
            return ResponseEntity.ok(workflow);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/workflows")
    public ResponseEntity<ApprovalWorkflowDTO> createWorkflow(@RequestBody ApprovalWorkflowDTO workflowDTO) {
        ApprovalWorkflowDTO createdWorkflow = workflowService.createWorkflow(workflowDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdWorkflow);
    }

    @PutMapping("/workflows/{id}")
    public ResponseEntity<ApprovalWorkflowDTO> updateWorkflow(@PathVariable Long id, @RequestBody ApprovalWorkflowDTO workflowDTO) {
        try {
            ApprovalWorkflowDTO updatedWorkflow = workflowService.updateWorkflow(id, workflowDTO);
            return ResponseEntity.ok(updatedWorkflow);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/workflows/{id}")
    public ResponseEntity<Void> deleteWorkflow(@PathVariable Long id) {
        try {
            workflowService.deleteWorkflow(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/workflows/{workflowId}/steps")
    public ResponseEntity<List<ApprovalStepDTO>> getStepsByWorkflowId(@PathVariable Long workflowId) {
        List<ApprovalStepDTO> steps = workflowService.getStepsByWorkflowId(workflowId);
        return ResponseEntity.ok(steps);
    }

    @GetMapping("/steps/{id}")
    public ResponseEntity<ApprovalStepDTO> getStepById(@PathVariable Long id) {
        ApprovalStepDTO step = workflowService.getStepById(id);
        if (step != null) {
            return ResponseEntity.ok(step);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/steps")
    public ResponseEntity<ApprovalStepDTO> createStep(@RequestBody ApprovalStepDTO stepDTO) {
        ApprovalStepDTO createdStep = workflowService.createStep(stepDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdStep);
    }

    @PutMapping("/steps/{id}")
    public ResponseEntity<ApprovalStepDTO> updateStep(@PathVariable Long id, @RequestBody ApprovalStepDTO stepDTO) {
        try {
            ApprovalStepDTO updatedStep = workflowService.updateStep(id, stepDTO);
            return ResponseEntity.ok(updatedStep);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/steps/{id}")
    public ResponseEntity<Void> deleteStep(@PathVariable Long id) {
        try {
            workflowService.deleteStep(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/requests/requester/{requesterUserId}")
    public ResponseEntity<Page<ApprovalRequestDTO>> getRequestsByRequester(
            @PathVariable Long requesterUserId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<ApprovalRequestDTO> requests = workflowService.getRequestsByRequester(requesterUserId, pageable);
        return ResponseEntity.ok(requests);
    }

    @GetMapping("/requests/approver/{approverUserId}")
    public ResponseEntity<Page<ApprovalRequestDTO>> getPendingApprovals(
            @PathVariable Long approverUserId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<ApprovalRequestDTO> requests = workflowService.getPendingApprovals(approverUserId, pageable);
        return ResponseEntity.ok(requests);
    }

    @GetMapping("/requests/{id}")
    public ResponseEntity<ApprovalRequestDTO> getRequestById(@PathVariable Long id) {
        ApprovalRequestDTO request = workflowService.getRequestById(id);
        if (request != null) {
            return ResponseEntity.ok(request);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/requests")
    public ResponseEntity<ApprovalRequestDTO> createRequest(@RequestBody ApprovalRequestDTO requestDTO) {
        ApprovalRequestDTO createdRequest = workflowService.createRequest(requestDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdRequest);
    }

    @PostMapping("/requests/{id}/approve")
    public ResponseEntity<ApprovalRequestDTO> approveRequest(
            @PathVariable Long id,
            @RequestParam Long approverUserId,
            @RequestParam(required = false) String comments) {
        try {
            ApprovalRequestDTO approvedRequest = workflowService.approveRequest(id, approverUserId, comments);
            return ResponseEntity.ok(approvedRequest);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/requests/{id}/reject")
    public ResponseEntity<ApprovalRequestDTO> rejectRequest(
            @PathVariable Long id,
            @RequestParam Long approverUserId,
            @RequestParam(required = false) String comments) {
        try {
            ApprovalRequestDTO rejectedRequest = workflowService.rejectRequest(id, approverUserId, comments);
            return ResponseEntity.ok(rejectedRequest);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/requests/{id}")
    public ResponseEntity<Void> deleteRequest(@PathVariable Long id) {
        try {
            workflowService.deleteRequest(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/workflows/{workflowId}/escalations")
    public ResponseEntity<List<EscalationPolicyDTO>> getEscalationPoliciesByWorkflowId(@PathVariable Long workflowId) {
        List<EscalationPolicyDTO> policies = workflowService.getEscalationPoliciesByWorkflowId(workflowId);
        return ResponseEntity.ok(policies);
    }

    @GetMapping("/escalations/{id}")
    public ResponseEntity<EscalationPolicyDTO> getEscalationPolicyById(@PathVariable Long id) {
        EscalationPolicyDTO policy = workflowService.getEscalationPolicyById(id);
        if (policy != null) {
            return ResponseEntity.ok(policy);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/escalations")
    public ResponseEntity<EscalationPolicyDTO> createEscalationPolicy(@RequestBody EscalationPolicyDTO escalationDTO) {
        EscalationPolicyDTO createdPolicy = workflowService.createEscalationPolicy(escalationDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdPolicy);
    }

    @PutMapping("/escalations/{id}")
    public ResponseEntity<EscalationPolicyDTO> updateEscalationPolicy(@PathVariable Long id, @RequestBody EscalationPolicyDTO escalationDTO) {
        try {
            EscalationPolicyDTO updatedPolicy = workflowService.updateEscalationPolicy(id, escalationDTO);
            return ResponseEntity.ok(updatedPolicy);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/escalations/{id}")
    public ResponseEntity<Void> deleteEscalationPolicy(@PathVariable Long id) {
        try {
            workflowService.deleteEscalationPolicy(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
