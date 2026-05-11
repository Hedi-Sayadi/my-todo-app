package com.hedi.todo.backend.util;

import org.springframework.stereotype.Component;

import com.hedi.todo.backend.dto.ReminderRequestDTO;
import com.hedi.todo.backend.dto.ReminderResponseDTO;
import com.hedi.todo.backend.entity.Reminder;

/**
 * Mapper component for converting between Reminder entity and DTOs.
 */
@Component
public class ReminderMapper {
	private final TaskMapper taskMapper;

	public ReminderMapper(TaskMapper taskMapper) {
		this.taskMapper = taskMapper;
	}

	public ReminderResponseDTO toResponseDTO(Reminder reminder) {
		if (reminder == null) {
			return null;
		}

		return ReminderResponseDTO.builder()
			.id(reminder.getId())
			.task(taskMapper.toResponseDTO(reminder.getTask()))
			.reminderAt(reminder.getReminderAt())
			.note(reminder.getNote())
			.status(reminder.getStatus())
			.snoozeUntil(reminder.getSnoozeUntil())
			.createdAt(reminder.getCreatedAt())
			.updatedAt(reminder.getUpdatedAt())
			.build();
	}

	public Reminder toEntity(ReminderRequestDTO requestDTO) {
		if (requestDTO == null) {
			return null;
		}

		return Reminder.builder()
			.reminderAt(requestDTO.getReminderAt())
			.note(requestDTO.getNote())
			.status(requestDTO.getStatus())
			.build();
	}

	public void updateEntity(ReminderRequestDTO requestDTO, Reminder reminder) {
		if (requestDTO == null) {
			return;
		}

		reminder.setReminderAt(requestDTO.getReminderAt());
		reminder.setNote(requestDTO.getNote());
		reminder.setStatus(requestDTO.getStatus());
	}
}