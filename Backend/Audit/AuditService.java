package org.mm.FinanceTracker.Audit;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import org.mm.FinanceTracker.Users.UserService;
import org.mm.FinanceTracker.Users.User;
import org.mm.FinanceTracker.Audit.dto.AuditLogDTO;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuditService {

	private final AuditLogRepository auditLogRepository;
	private final ObjectMapper objectMapper;
	private final UserService userService;

	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public void logEvent(AuditEvent event) {
		try {
			LogEntry logEntry = new LogEntry();
			logEntry.setEventType(event.getEventType());
			logEntry.setEntityType(event.getEntityType());
			logEntry.setEntityId(event.getEntityId());
			logEntry.setOperation(event.getOperation());
			logEntry.setOldValues(event.getOldValues());
			logEntry.setNewValues(event.getNewValues());
			logEntry.setDescription(event.getDescription());
			logEntry.setSourceModule(event.getSourceModule());

			captureRequestContext(logEntry);

			generateHash(logEntry);

			auditLogRepository.save(logEntry);
			log.debug("Audit event logged: {} - {}:{}", 
					event.getEventType(), event.getEntityType(), event.getEntityId());

		} catch (Exception e) {
			log.error("Failed to log audit event: {}", event, e);
		}
	}

	private void captureRequestContext(LogEntry logEntry) {
		try {
			ServletRequestAttributes attributes = 
				(ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
			if (attributes != null) {
				HttpServletRequest request = attributes.getRequest();
				logEntry.setUserIp(getClientIp(request));
				logEntry.setUserAgent(request.getHeader("User-Agent"));
				logEntry.setHttpMethod(request.getMethod());
				logEntry.setEndpoint(request.getRequestURI());

				String userId = request.getHeader("X-User-Id");
				if (userId != null) {
					logEntry.setUserId(userId);
				}
			}
		} catch (Exception e) {
			log.warn("Could not capture request context for audit", e);
		}
	}

	private String getClientIp(HttpServletRequest request) {
		String ip = request.getHeader("X-Forwarded-For");
		if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
			ip = request.getHeader("Proxy-Client-IP");
		}
		if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
			ip = request.getHeader("WL-Proxy-Client-IP");
		}
		if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
			ip = request.getRemoteAddr();
		}
		return ip;
	}

	private void generateHash(LogEntry logEntry) {
		try {
			LogEntry previousEntry = auditLogRepository.findFirstByOrderByEventTimestampDesc();
			String previousHash = (previousEntry != null) ? previousEntry.getHash() : "";

			String hashString = logEntry.getEventType() + 
				logEntry.getEntityType() + 
				logEntry.getEntityId() + 
				logEntry.getOperation() + 
				logEntry.getDescription() + 
				logEntry.getSourceModule() + 
				logEntry.getUserId() + 
				logEntry.getEventTimestamp() + 
				previousHash;

			java.security.MessageDigest digest = java.security.MessageDigest.getInstance("SHA-256");
			byte[] hashBytes = digest.digest(hashString.getBytes("UTF-8"));
			StringBuilder hexString = new StringBuilder();
			for (byte b : hashBytes) {
				String hex = Integer.toHexString(0xff & b);
				if (hex.length() == 1) hexString.append('0');
				hexString.append(hex);
			}

			logEntry.setHash(hexString.toString());
			logEntry.setPreviousHash(previousHash);
		} catch (Exception e) {
			log.error("Failed to generate hash for audit log entry", e);
		}
	}

	public void logEntityChange(String entityType, Object entityId, 
			LogEntry.Operation operation,
			Object oldEntity, Object newEntity,
			String description) {
		try {
			AuditEvent event = AuditEvent.builder()
				.eventType(entityType + "_" + operation.name())
				.entityType(entityType)
				.entityId(String.valueOf(entityId))
				.operation(operation)
				.oldValues(convertToMap(oldEntity))
				.newValues(convertToMap(newEntity))
				.description(description)
				.sourceModule("ENTITY_SERVICE")
				.build();

			logEvent(event);
		} catch (Exception e) {
			log.error("Failed to log entity change", e);
		}
	}

	@SuppressWarnings("unchecked")
	private Map<String, Object> convertToMap(Object obj) {
		if (obj == null) return null;
		return objectMapper.convertValue(obj, Map.class);
	}

	public boolean verifyAuditTrail(String entityType, String entityId) {
		try {
			LogEntry previousEntry = null;
			boolean isValid = true;

			java.util.List<LogEntry> entries = auditLogRepository
				.findByEntityTypeAndEntityIdOrderByEventTimestampDesc(entityType, entityId);

			for (int i = entries.size() - 1; i >= 0; i--) {
				LogEntry entry = entries.get(i);

				String previousHash = (previousEntry != null) ? previousEntry.getHash() : "";
				String hashString = entry.getEventType() + 
					entry.getEntityType() + 
					entry.getEntityId() + 
					entry.getOperation() + 
					entry.getDescription() + 
					entry.getSourceModule() + 
					entry.getUserId() + 
					entry.getEventTimestamp() + 
					previousHash;

				java.security.MessageDigest digest = java.security.MessageDigest.getInstance("SHA-256");
				byte[] hashBytes = digest.digest(hashString.getBytes("UTF-8"));
				StringBuilder hexString = new StringBuilder();
				for (byte b : hashBytes) {
					String hex = Integer.toHexString(0xff & b);
					if (hex.length() == 1) hexString.append('0');
					hexString.append(hex);
				}

				if (!entry.getHash().equals(hexString.toString())) {
					isValid = false;
					log.warn("Hash mismatch detected in audit log entry ID: {}", entry.getId());
				}

				previousEntry = entry;
			}

			return isValid;
		} catch (Exception e) {
			log.error("Failed to verify audit integrity", e);
			return false;
		}
	}

	public List<AuditLogDTO> getAuditLogsForUser(String userId, Instant start, Instant end) {
		List<LogEntry> logs = auditLogRepository.findByUserIdAndEventTimestampBetweenOrderByEventTimestampDesc(userId, start, end);
		return logs.stream().map(this::convertToDTO).collect(Collectors.toList());
	}

	public List<AuditLogDTO> getAuditLogsForEntity(String entityType, String entityId) {
		List<LogEntry> logs = auditLogRepository.findByEntityTypeAndEntityIdOrderByEventTimestampDesc(entityType, entityId);
		return logs.stream().map(this::convertToDTO).collect(Collectors.toList());
	}

	public List<AuditLogDTO> getAuditLogsForEventType(String eventType, Instant start, Instant end) {
		List<LogEntry> logs = auditLogRepository.findByEventTypeAndEventTimestampBetweenOrderByEventTimestampDesc(eventType, start, end);
		return logs.stream().map(this::convertToDTO).collect(Collectors.toList());
	}

	private AuditLogDTO convertToDTO(LogEntry logEntry) {
		AuditLogDTO dto = new AuditLogDTO();
		dto.setId(logEntry.getId());
		dto.setEventTimestamp(logEntry.getEventTimestamp());
		dto.setUserId(logEntry.getUserId());
		dto.setUserIp(logEntry.getUserIp());
		dto.setUserAgent(logEntry.getUserAgent());
		dto.setEventType(logEntry.getEventType());
		dto.setEntityType(logEntry.getEntityType());
		dto.setEntityId(logEntry.getEntityId());
		dto.setOperation(logEntry.getOperation().name());
		dto.setOldValues(logEntry.getOldValues());
		dto.setNewValues(logEntry.getNewValues());
		dto.setSourceModule(logEntry.getSourceModule());
		dto.setDescription(logEntry.getDescription());
		dto.setHttpMethod(logEntry.getHttpMethod());
		dto.setEndpoint(logEntry.getEndpoint());
		dto.setHash(logEntry.getHash());
		dto.setPreviousHash(logEntry.getPreviousHash());
		return dto;
	}

	public java.util.List<String> findDistinctEntityTypes() {
		return auditLogRepository.findDistinctEntityTypes();
	}

	public java.util.List<String> findDistinctEventTypes() {
		return auditLogRepository.findDistinctEventTypes();
	}
}
