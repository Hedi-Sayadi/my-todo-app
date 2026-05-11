package com.hedi.todo.backend.dto;

import java.time.LocalDateTime;

import com.hedi.todo.backend.entity.ReminderStatus;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for creating or updating a Reminder.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReminderRequestDTO {

	@NotNull(message = "Reminder task is required")
	private Long taskId;

	@NotNull(message = "Reminder time is required")
	private LocalDateTime reminderAt;

	private String note;

	@NotNull(message = "Reminder status is required")
	private ReminderStatus status;
}