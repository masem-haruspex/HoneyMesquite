package org.mm.FinanceTracker.Users;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class PermissionChecker {

    @Autowired
    private UserService userService;

    public boolean hasPermission(User user, String permissionName) {
        return userService.hasPermission(user, permissionName);
    }

    public boolean hasRole(User user, String roleName) {
        return user.getRoles().stream()
                .anyMatch(role -> role.getName().equals(roleName));
    }

    public boolean belongsToOrganization(User user, Long organizationId) {
        return user.getOrganization() != null && 
               user.getOrganization().getId().equals(organizationId);
    }

    public boolean belongsToDepartment(User user, Long departmentId) {
        return user.getDepartment() != null && 
               user.getDepartment().getId().equals(departmentId);
    }

    public boolean isUserActive(User user) {
        return user.getIsActive() != null && user.getIsActive();
    }

    public boolean isUserLocked(User user) {
        return user.getIsLocked() != null && user.getIsLocked();
    }
}
