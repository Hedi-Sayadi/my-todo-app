package com.hedi.todo.backend.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.hedi.todo.backend.dto.ReminderRequestDTO;
import com.hedi.todo.backend.dto.ReminderResponseDTO;
import com.hedi.todo.backend.entity.Reminder;
import com.hedi.todo.backend.entity.ReminderStatus;
import com.hedi.todo.backend.entity.Task;
import com.hedi.todo.backend.exception.ReminderNotFoundException;
import com.hedi.todo.backend.exception.TaskNotFoundException;
import com.hedi.todo.backend.repository.ReminderRepository;
import com.hedi.todo.backend.repository.TaskRepository;
import com.hedi.todo.backend.util.ReminderMapper;

import lombok.RequiredArgsConstructor;

/**
 * Service layer for Reminder business logic.
 */
@Service
@Transactional
@RequiredArgsConstructor
public class ReminderService {

	private final ReminderRepository reminderRepository;
	private final TaskRepository taskRepository;
	private final ReminderMapper reminderMapper;

	public ReminderResponseDTO createReminder(ReminderRequestDTO requestDTO) {
		Task task = taskRepository.findById(requestDTO.getTaskId())
			.orElseThrow(() -> new TaskNotFoundException(requestDTO.getTaskId()));

		Reminder reminder = reminderMapper.toEntity(requestDTO);
		reminder.setTask(task);
		if (reminder.getStatus() == null) {
			reminder.setStatus(ReminderStatus.PENDING);
		}

		return reminderMapper.toResponseDTO(reminderRepository.save(reminder));
	}

	@Transactional(readOnly = true)
	public List<ReminderResponseDTO> getAllReminders() {
		return reminderRepository.findAllByOrderByReminderAtAsc()
			.stream()
			.map(reminderMapper::toResponseDTO)
			.toList();
	}

	@Transactional(readOnly = true)
	public ReminderResponseDTO getReminderById(Long id) {
		Reminder reminder = reminderRepository.findById(id)
			.orElseThrow(() -> new ReminderNotFoundException(id));
		return reminderMapper.toResponseDTO(reminder);
	}

	public ReminderResponseDTO updateReminder(Long id, ReminderRequestDTO requestDTO) {
		Reminder reminder = reminderRepository.findById(id)
			.orElseThrow(() -> new ReminderNotFoundException(id));

		Task task = taskRepository.findById(requestDTO.getTaskId())
			.orElseThrow(() -> new TaskNotFoundException(requestDTO.getTaskId()));

		reminder.setTask(task);
		reminderMapper.updateEntity(requestDTO, reminder);
		if (reminder.getStatus() != ReminderStatus.SNOOZED) {
			reminder.setSnoozeUntil(null);
		}

		return reminderMapper.toResponseDTO(reminderRepository.save(reminder));
	}

	public void deleteReminder(Long id) {
		if (!reminderRepository.existsById(id)) {
			throw new ReminderNotFoundException(id);
		}

		reminderRepository.deleteById(id);
	}

	public ReminderResponseDTO snoozeReminder(Long id, Integer minutes) {
		Reminder reminder = reminderRepository.findById(id)
			.orElseThrow(() -> new ReminderNotFoundException(id));

		reminder.setSnoozeUntil(LocalDateTime.now().plusMinutes(minutes));
		reminder.setStatus(ReminderStatus.SNOOZED);
		return reminderMapper.toResponseDTO(reminderRepository.save(reminder));
	}

	public ReminderResponseDTO markReminderDone(Long id) {
		Reminder reminder = reminderRepository.findById(id)
			.orElseThrow(() -> new ReminderNotFoundException(id));

		reminder.setStatus(ReminderStatus.DONE);
		reminder.setSnoozeUntil(null);
		return reminderMapper.toResponseDTO(reminderRepository.save(reminder));
	}
}