package com.hedi.todo.backend.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.hedi.todo.backend.dto.ReminderRequestDTO;
import com.hedi.todo.backend.dto.ReminderResponseDTO;
import com.hedi.todo.backend.entity.Category;
import com.hedi.todo.backend.entity.Reminder;
import com.hedi.todo.backend.entity.ReminderStatus;
import com.hedi.todo.backend.entity.Task;
import com.hedi.todo.backend.entity.TaskPriority;
import com.hedi.todo.backend.entity.TaskStatus;
import com.hedi.todo.backend.exception.DuplicateReminderException;
import com.hedi.todo.backend.exception.ReminderNotFoundException;
import com.hedi.todo.backend.exception.TaskNotFoundException;
import com.hedi.todo.backend.repository.ReminderRepository;
import com.hedi.todo.backend.repository.TaskRepository;
import com.hedi.todo.backend.util.ReminderMapper;

@ExtendWith(MockitoExtension.class)
class ReminderServiceTest {

	@Mock
	private ReminderRepository reminderRepository;

	@Mock
	private TaskRepository taskRepository;

	@Mock
	private ReminderMapper reminderMapper;

	@InjectMocks
	private ReminderService reminderService;

	@Captor
	private ArgumentCaptor<Reminder> reminderCaptor;

	private Task task;
	private Reminder reminder;
	private ReminderRequestDTO request;
	private ReminderResponseDTO response;

	@BeforeEach
	void setUp() {
		Category category = Category.builder()
			.id(3L)
			.name("Work")
			.build();

		task = Task.builder()
			.id(9L)
			.title("Submit report")
			.priority(TaskPriority.HIGH)
			.status(TaskStatus.TODO)
			.category(category)
			.build();

		request = ReminderRequestDTO.builder()
			.taskId(9L)
			.reminderAt(LocalDateTime.of(2026, 5, 20, 8, 30))
			.note("Morning reminder")
			.status(null)
			.build();

		reminder = Reminder.builder()
			.id(5L)
			.task(task)
			.reminderAt(LocalDateTime.of(2026, 5, 20, 8, 30))
			.note("Morning reminder")
			.status(ReminderStatus.PENDING)
			.build();

		response = ReminderResponseDTO.builder()
			.id(5L)
			.reminderAt(LocalDateTime.of(2026, 5, 20, 8, 30))
			.note("Morning reminder")
			.status(ReminderStatus.PENDING)
			.build();
	}

	@Test
	void createReminderShouldAttachTaskAndDefaultPendingStatus() {
		when(taskRepository.findById(9L)).thenReturn(Optional.of(task));
		when(reminderRepository.existsByTaskId(9L)).thenReturn(false);
		when(reminderMapper.toEntity(request)).thenReturn(Reminder.builder()
			.reminderAt(request.getReminderAt())
			.note(request.getNote())
			.status(null)
			.build());
		when(reminderRepository.save(reminderCaptor.capture())).thenAnswer(invocation -> invocation.getArgument(0));
		when(reminderMapper.toResponseDTO(any(Reminder.class))).thenReturn(response);

		ReminderResponseDTO result = reminderService.createReminder(request);

		assertThat(reminderCaptor.getValue().getTask()).isEqualTo(task);
		assertThat(reminderCaptor.getValue().getStatus()).isEqualTo(ReminderStatus.PENDING);
		assertThat(result).isEqualTo(response);
	}

	@Test
	void createReminderShouldThrowWhenTaskMissing() {
		when(taskRepository.findById(9L)).thenReturn(Optional.empty());

		assertThatThrownBy(() -> reminderService.createReminder(request))
			.isInstanceOf(TaskNotFoundException.class)
			.hasMessage("Task not found with id: 9");

		verify(reminderRepository, never()).save(any());
	}

	@Test
	void createReminderShouldThrowWhenDuplicateExists() {
		when(taskRepository.findById(9L)).thenReturn(Optional.of(task));
		when(reminderRepository.existsByTaskId(9L)).thenReturn(true);

		assertThatThrownBy(() -> reminderService.createReminder(request))
			.isInstanceOf(DuplicateReminderException.class)
			.hasMessage("A reminder already exists for task id: 9");

		verify(reminderRepository, never()).save(any());
	}

	@Test
	void getAllRemindersShouldMapAllResults() {
		when(reminderRepository.findAllByOrderByReminderAtAsc()).thenReturn(List.of(reminder));
		when(reminderMapper.toResponseDTO(reminder)).thenReturn(response);

		List<ReminderResponseDTO> results = reminderService.getAllReminders();

		assertThat(results).containsExactly(response);
	}

	@Test
	void getReminderByIdShouldReturnMappedReminder() {
		when(reminderRepository.findById(5L)).thenReturn(Optional.of(reminder));
		when(reminderMapper.toResponseDTO(reminder)).thenReturn(response);

		ReminderResponseDTO result = reminderService.getReminderById(5L);

		assertThat(result).isEqualTo(response);
	}

	@Test
	void getReminderByIdShouldThrowWhenMissing() {
		when(reminderRepository.findById(5L)).thenReturn(Optional.empty());

		assertThatThrownBy(() -> reminderService.getReminderById(5L))
			.isInstanceOf(ReminderNotFoundException.class)
			.hasMessage("Reminder not found with id: 5");
	}

	@Test
	void updateReminderShouldUpdateReminderAndReturnMappedResponse() {
		ReminderRequestDTO updateRequest = ReminderRequestDTO.builder()
			.taskId(9L)
			.reminderAt(LocalDateTime.of(2026, 5, 21, 9, 0))
			.note("Updated note")
			.status(ReminderStatus.PENDING)
			.build();

		Reminder updatedReminder = Reminder.builder()
			.id(5L)
			.task(task)
			.reminderAt(updateRequest.getReminderAt())
			.note(updateRequest.getNote())
			.status(ReminderStatus.PENDING)
			.build();

		ReminderResponseDTO updatedResponse = ReminderResponseDTO.builder()
			.id(5L)
			.reminderAt(updateRequest.getReminderAt())
			.note(updateRequest.getNote())
			.status(ReminderStatus.PENDING)
			.build();

		when(reminderRepository.findById(5L)).thenReturn(Optional.of(reminder));
		when(taskRepository.findById(9L)).thenReturn(Optional.of(task));
		when(reminderRepository.existsByTaskIdAndIdNot(9L, 5L)).thenReturn(false);
		doAnswer(invocation -> {
			reminder.setReminderAt(updateRequest.getReminderAt());
			reminder.setNote(updateRequest.getNote());
			reminder.setStatus(updateRequest.getStatus());
			return null;
		}).when(reminderMapper).updateEntity(updateRequest, reminder);
		when(reminderRepository.save(reminder)).thenReturn(updatedReminder);
		when(reminderMapper.toResponseDTO(updatedReminder)).thenReturn(updatedResponse);

		ReminderResponseDTO result = reminderService.updateReminder(5L, updateRequest);

		assertThat(result).isEqualTo(updatedResponse);
		assertThat(reminder.getTask()).isEqualTo(task);
	}

	@Test
	void updateReminderShouldThrowWhenReminderMissing() {
		when(reminderRepository.findById(5L)).thenReturn(Optional.empty());

		assertThatThrownBy(() -> reminderService.updateReminder(5L, request))
			.isInstanceOf(ReminderNotFoundException.class)
			.hasMessage("Reminder not found with id: 5");

		verify(taskRepository, never()).findById(any());
	}

	@Test
	void updateReminderShouldThrowWhenTaskMissing() {
		when(reminderRepository.findById(5L)).thenReturn(Optional.of(reminder));
		when(taskRepository.findById(9L)).thenReturn(Optional.empty());

		assertThatThrownBy(() -> reminderService.updateReminder(5L, request))
			.isInstanceOf(TaskNotFoundException.class)
			.hasMessage("Task not found with id: 9");

		verify(reminderRepository, never()).save(any());
	}

	@Test
	void updateReminderShouldThrowOnDuplicateTaskAssignment() {
		when(reminderRepository.findById(5L)).thenReturn(Optional.of(reminder));
		when(taskRepository.findById(9L)).thenReturn(Optional.of(task));
		when(reminderRepository.existsByTaskIdAndIdNot(9L, 5L)).thenReturn(true);

		assertThatThrownBy(() -> reminderService.updateReminder(5L, request))
			.isInstanceOf(DuplicateReminderException.class)
			.hasMessage("A reminder already exists for task id: 9");

		verify(reminderRepository, never()).save(any());
	}

	@Test
	void deleteReminderShouldDeleteExistingReminder() {
		when(reminderRepository.existsById(5L)).thenReturn(true);

		reminderService.deleteReminder(5L);

		verify(reminderRepository).deleteById(5L);
	}

	@Test
	void deleteReminderShouldThrowWhenMissing() {
		when(reminderRepository.existsById(5L)).thenReturn(false);

		assertThatThrownBy(() -> reminderService.deleteReminder(5L))
			.isInstanceOf(ReminderNotFoundException.class)
			.hasMessage("Reminder not found with id: 5");

		verify(reminderRepository, never()).deleteById(any());
	}

	@Test
	void snoozeReminderShouldSetSnoozeState() {
		when(reminderRepository.findById(5L)).thenReturn(Optional.of(reminder));
		when(reminderRepository.save(reminder)).thenAnswer(invocation -> invocation.getArgument(0));
		when(reminderMapper.toResponseDTO(any(Reminder.class))).thenReturn(response);

		ReminderResponseDTO result = reminderService.snoozeReminder(5L, 30);

		assertThat(result).isEqualTo(response);
		assertThat(reminder.getStatus()).isEqualTo(ReminderStatus.SNOOZED);
		assertThat(reminder.getSnoozeUntil()).isNotNull();
	}

	@Test
	void markReminderDoneShouldSetDoneAndClearSnooze() {
		reminder.setSnoozeUntil(LocalDateTime.now().plusMinutes(10));
		when(reminderRepository.findById(5L)).thenReturn(Optional.of(reminder));
		when(reminderRepository.save(reminder)).thenAnswer(invocation -> invocation.getArgument(0));
		when(reminderMapper.toResponseDTO(any(Reminder.class))).thenReturn(response);

		ReminderResponseDTO result = reminderService.markReminderDone(5L);

		assertThat(result).isEqualTo(response);
		assertThat(reminder.getStatus()).isEqualTo(ReminderStatus.DONE);
		assertThat(reminder.getSnoozeUntil()).isNull();
	}
}