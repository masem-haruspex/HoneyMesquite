package org.mm.FinanceTracker.Users;

import org.mm.FinanceTracker.Departments.Department;
import org.mm.FinanceTracker.Departments.DepartmentRepository;
import org.mm.FinanceTracker.Users.dto.UserDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class UserService {

	@Autowired private UserRepository userRepository;
	@Autowired private OrganizationRepository organizationRepository;
	@Autowired private DepartmentRepository departmentRepository;
	@Autowired private RoleRepository roleRepository;
	@Autowired private PermissionRepository permissionRepository;
	@Autowired private PasswordEncoder passwordEncoder;

	@Transactional
	public User createAuthUser(String username, String email, String rawPassword) {
		User user = new User();
		user.setUsername(username);
		user.setEmail(email);
		user.setFirstName("User");
		user.setLastName("User");
		user.setPasswordHash(passwordEncoder.encode(rawPassword));
		user.setIsActive(true);
		user.setIsLocked(false);
		user.setFailedLoginAttempts(0);
		return userRepository.save(user);
	}

	public Optional<User> findByUsername(String username) {
		return userRepository.findByUsername(username);
	}

	public Optional<User> findByEmail(String email) {
		return userRepository.findByEmail(email);
	}

	public List<UserDTO> getAllUsers() {
		return userRepository.findAll().stream().map(this::convertToDTO).collect(Collectors.toList());
	}

	public Optional<UserDTO> getUserById(Long id) {
		return userRepository.findById(id).map(this::convertToDTO);
	}

	@Transactional
	public UserDTO createUser(UserDTO dto) {
		User user = new User();
		user.setUsername(dto.getUsername());
		user.setEmail(dto.getEmail());
		user.setFirstName(dto.getFirstName() != null ? dto.getFirstName() : "User");
		user.setLastName(dto.getLastName() != null ? dto.getLastName() : "User");
		user.setPhone(dto.getPhone());
		user.setIsActive(dto.getIsActive() != null ? dto.getIsActive() : true);
		user.setIsLocked(dto.getIsLocked() != null ? dto.getIsLocked() : false);
		if (dto.getOrganizationId() != null) {
			user.setOrganization(organizationRepository.findById(dto.getOrganizationId()).orElse(null));
		}
		if (dto.getDepartmentId() != null) {
			user.setDepartment(departmentRepository.findById(dto.getDepartmentId()).orElse(null));
		}
		return convertToDTO(userRepository.save(user));
	}

	@Transactional
	public UserDTO updateUser(Long id, UserDTO dto) {
		User user = userRepository.findById(id)
			.orElseThrow(() -> new RuntimeException("User not found: " + id));
		if (dto.getUsername() != null) user.setUsername(dto.getUsername());
		if (dto.getEmail() != null) user.setEmail(dto.getEmail());
		if (dto.getFirstName() != null) user.setFirstName(dto.getFirstName());
		if (dto.getLastName() != null) user.setLastName(dto.getLastName());
		if (dto.getPhone() != null) user.setPhone(dto.getPhone());
		if (dto.getIsActive() != null) user.setIsActive(dto.getIsActive());
		if (dto.getIsLocked() != null) user.setIsLocked(dto.getIsLocked());
		if (dto.getOrganizationId() != null) {
			user.setOrganization(organizationRepository.findById(dto.getOrganizationId()).orElse(null));
		}
		if (dto.getDepartmentId() != null) {
			user.setDepartment(departmentRepository.findById(dto.getDepartmentId()).orElse(null));
		}
		return convertToDTO(userRepository.save(user));
	}

	@Transactional
	public void deleteUser(Long id) {
		if (!userRepository.existsById(id)) throw new RuntimeException("User not found: " + id);
		userRepository.deleteById(id);
	}

	public List<Role> getAllRoles() { return roleRepository.findAll(); }
	public List<Permission> getAllPermissions() { return permissionRepository.findAll(); }
	public Optional<Role> getRoleById(Long id) { return roleRepository.findById(id); }
	public Optional<Role> getRoleByName(String name) { return roleRepository.findByName(name); }
	public Optional<Permission> getPermissionById(Long id) { return permissionRepository.findById(id); }

	@Transactional
	public Role createRole(Role role) {
		role.setCreatedAt(LocalDateTime.now());
		role.setUpdatedAt(LocalDateTime.now());
		return roleRepository.save(role);
	}

	@Transactional
	public Permission createPermission(Permission permission) {
		permission.setCreatedAt(LocalDateTime.now());
		permission.setUpdatedAt(LocalDateTime.now());
		return permissionRepository.save(permission);
	}

	@Transactional
	public void assignRoleToUser(Long userId, Long roleId) {
		User u = userRepository.findById(userId).orElseThrow();
		Role r = roleRepository.findById(roleId).orElseThrow();
		u.getRoles().add(r);
		userRepository.save(u);
	}

	@Transactional
	public void assignPermissionToUser(Long userId, Long permissionId) {
		User u = userRepository.findById(userId).orElseThrow();
		Permission p = permissionRepository.findById(permissionId).orElseThrow();
		u.getPermissions().add(p);
		userRepository.save(u);
	}

	public boolean hasPermission(User user, String permissionName) {
		for (Permission p : user.getPermissions()) if (p.getName().equals(permissionName)) return true;
		for (Role r : user.getRoles())
			for (Permission p : r.getPermissions())
				if (p.getName().equals(permissionName)) return true;
		return false;
	}

	public Set<Permission> getUserPermissions(Long userId) {
		return userRepository.findById(userId).orElseThrow().getPermissions();
	}

	public Set<Role> getUserRoles(Long userId) {
		return userRepository.findById(userId).orElseThrow().getRoles();
	}

	private UserDTO convertToDTO(User user) {
		UserDTO dto = new UserDTO();
		dto.setId(user.getId());
		dto.setUsername(user.getUsername());
		dto.setEmail(user.getEmail());
		dto.setFirstName(user.getFirstName());
		dto.setLastName(user.getLastName());
		dto.setPhone(user.getPhone());
		dto.setIsActive(user.getIsActive());
		dto.setIsLocked(user.getIsLocked());
		dto.setLastLoginAt(user.getLastLoginAt());
		if (user.getOrganization() != null) dto.setOrganizationId(user.getOrganization().getId());
		if (user.getDepartment() != null) dto.setDepartmentId(user.getDepartment().getId());
		return dto;
	}

	public java.util.Optional<User> findEntityById(Long id) {
		return userRepository.findById(id);
	}
}
