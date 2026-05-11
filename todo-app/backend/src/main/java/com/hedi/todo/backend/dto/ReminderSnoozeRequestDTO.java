package com.hedi.todo.backend.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for snoozing a reminder by a relative number of minutes.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReminderSnoozeRequestDTO {

	@NotNull(message = "Snooze minutes are required")
	@Min(value = 1, message = "Snooze minutes must be at least 1")
	private Integer minutes;
}