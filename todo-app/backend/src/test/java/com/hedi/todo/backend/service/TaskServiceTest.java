package com.hedi.todo.backend.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.hedi.todo.backend.dto.CategoryResponseDTO;
import com.hedi.todo.backend.dto.TaskRequestDTO;
import com.hedi.todo.backend.dto.TaskResponseDTO;
import com.hedi.todo.backend.entity.Category;
import com.hedi.todo.backend.entity.Task;
import com.hedi.todo.backend.entity.TaskPriority;
import com.hedi.todo.backend.entity.TaskRecurrence;
import com.hedi.todo.backend.entity.TaskStatus;
import com.hedi.todo.backend.exception.CategoryNotFoundException;
import com.hedi.todo.backend.exception.TaskNotFoundException;
import com.hedi.todo.backend.repository.CategoryRepository;
import com.hedi.todo.backend.repository.TaskRepository;
import com.hedi.todo.backend.util.TaskMapper;
import java.time.LocalDate;
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

@ExtendWith(MockitoExtension.class)
class TaskServiceTest {

  @Mock private TaskRepository taskRepository;

  @Mock private CategoryRepository categoryRepository;

  @Mock private TaskMapper taskMapper;

  @InjectMocks private TaskService taskService;

  @Captor private ArgumentCaptor<Task> taskCaptor;

  private Category category;
  private TaskRequestDTO request;
  private Task task;
  private TaskResponseDTO response;

  @BeforeEach
  void setUp() {
    category = Category.builder().id(11L).name("Work").description("Work tasks").build();

    request =
        TaskRequestDTO.builder()
            .title("Finish report")
            .description("Prepare monthly summary")
            .priority(TaskPriority.HIGH)
            .recurrencePattern(TaskRecurrence.NONE)
            .deadline(LocalDate.of(2026, 5, 20))
            .categoryId(11L)
            .status(TaskStatus.TODO)
            .build();

    task =
        Task.builder()
            .id(7L)
            .title("Finish report")
            .description("Prepare monthly summary")
            .priority(TaskPriority.HIGH)
            .recurrencePattern(TaskRecurrence.NONE)
            .deadline(LocalDate.of(2026, 5, 20))
            .category(category)
            .status(TaskStatus.TODO)
            .createdAt(LocalDateTime.of(2026, 5, 17, 10, 0))
            .updatedAt(LocalDateTime.of(2026, 5, 17, 10, 0))
            .build();

    response =
        TaskResponseDTO.builder()
            .id(7L)
            .title("Finish report")
            .description("Prepare monthly summary")
            .priority(TaskPriority.HIGH)
            .recurrencePattern(TaskRecurrence.NONE)
            .deadline(LocalDate.of(2026, 5, 20))
            .category(
                CategoryResponseDTO.builder()
                    .id(11L)
                    .name("Work")
                    .description("Work tasks")
                    .build())
            .status(TaskStatus.TODO)
            .createdAt(LocalDateTime.of(2026, 5, 17, 10, 0))
            .updatedAt(LocalDateTime.of(2026, 5, 17, 10, 0))
            .build();
  }

  @Test
  void createTaskShouldAttachCategoryAndReturnMappedResponse() {
    when(categoryRepository.findById(11L)).thenReturn(Optional.of(category));
    when(taskMapper.toEntity(request)).thenReturn(task);
    when(taskRepository.save(taskCaptor.capture())).thenReturn(task);
    when(taskMapper.toResponseDTO(task)).thenReturn(response);

    TaskResponseDTO result = taskService.createTask(request);

    assertThat(taskCaptor.getValue().getCategory()).isEqualTo(category);
    assertThat(result).isEqualTo(response);
  }

  @Test
  void createTaskShouldThrowWhenCategoryMissing() {
    when(categoryRepository.findById(11L)).thenReturn(Optional.empty());

    assertThatThrownBy(() -> taskService.createTask(request))
        .isInstanceOf(CategoryNotFoundException.class)
        .hasMessage("Category not found with id: 11");

    verify(taskRepository, never()).save(any());
    verify(taskMapper, never()).toEntity(any());
  }

  @Test
  void getTaskByIdShouldReturnMappedTask() {
    when(taskRepository.findById(7L)).thenReturn(Optional.of(task));
    when(taskMapper.toResponseDTO(task)).thenReturn(response);

    TaskResponseDTO result = taskService.getTaskById(7L);

    assertThat(result).isEqualTo(response);
  }

  @Test
  void getTaskByIdShouldThrowWhenTaskMissing() {
    when(taskRepository.findById(7L)).thenReturn(Optional.empty());

    assertThatThrownBy(() -> taskService.getTaskById(7L))
        .isInstanceOf(TaskNotFoundException.class)
        .hasMessage("Task not found with id: 7");

    verify(taskMapper, never()).toResponseDTO(any());
  }

  @Test
  void getAllTasksShouldMapAllResults() {
    when(taskRepository.findAll()).thenReturn(List.of(task));
    when(taskMapper.toResponseDTO(task)).thenReturn(response);

    List<TaskResponseDTO> results = taskService.getAllTasks();

    assertThat(results).containsExactly(response);
  }

  @Test
  void getTasksByStatusShouldFilterAndMap() {
    when(taskRepository.findByStatus(TaskStatus.TODO)).thenReturn(List.of(task));
    when(taskMapper.toResponseDTO(task)).thenReturn(response);

    List<TaskResponseDTO> results = taskService.getTasksByStatus(TaskStatus.TODO);

    assertThat(results).containsExactly(response);
  }

  @Test
  void getTasksByCategoryShouldReturnMappedResults() {
    when(categoryRepository.findById(11L)).thenReturn(Optional.of(category));
    when(taskRepository.findByCategory(category)).thenReturn(List.of(task));
    when(taskMapper.toResponseDTO(task)).thenReturn(response);

    List<TaskResponseDTO> results = taskService.getTasksByCategory(11L);

    assertThat(results).containsExactly(response);
  }

  @Test
  void searchTasksShouldUseKeywordAcrossTitleAndDescription() {
    when(taskRepository.findByTitleContainingIgnoreCaseOrDescriptionContainingIgnoreCase(
            "report", "report"))
        .thenReturn(List.of(task));
    when(taskMapper.toResponseDTO(task)).thenReturn(response);

    List<TaskResponseDTO> results = taskService.searchTasks("report");

    assertThat(results).containsExactly(response);
  }

  @Test
  void updateTaskShouldUpdateExistingTaskAndReturnMappedResponse() {
    TaskRequestDTO updateRequest =
        TaskRequestDTO.builder()
            .title("Finish report updated")
            .description("Updated summary")
            .priority(TaskPriority.MEDIUM)
            .deadline(LocalDate.of(2026, 5, 22))
            .categoryId(11L)
            .status(TaskStatus.IN_PROGRESS)
            .build();

    Task updatedTask =
        Task.builder()
            .id(7L)
            .title("Finish report updated")
            .description("Updated summary")
            .priority(TaskPriority.MEDIUM)
            .deadline(LocalDate.of(2026, 5, 22))
            .category(category)
            .status(TaskStatus.IN_PROGRESS)
            .build();

    TaskResponseDTO updatedResponse =
        TaskResponseDTO.builder()
            .id(7L)
            .title("Finish report updated")
            .description("Updated summary")
            .priority(TaskPriority.MEDIUM)
            .deadline(LocalDate.of(2026, 5, 22))
            .category(
                CategoryResponseDTO.builder()
                    .id(11L)
                    .name("Work")
                    .description("Work tasks")
                    .build())
            .status(TaskStatus.IN_PROGRESS)
            .build();

    when(taskRepository.findById(7L)).thenReturn(Optional.of(task));
    when(categoryRepository.findById(11L)).thenReturn(Optional.of(category));
    when(taskMapper.updateEntity(updateRequest, task)).thenReturn(updatedTask);
    when(taskRepository.save(updatedTask)).thenReturn(updatedTask);
    when(taskMapper.toResponseDTO(updatedTask)).thenReturn(updatedResponse);

    TaskResponseDTO result = taskService.updateTask(7L, updateRequest);

    assertThat(result).isEqualTo(updatedResponse);
    assertThat(task.getCategory()).isEqualTo(category);
  }

  @Test
  void updateRecurringCompletedTaskShouldCreateNextOccurrence() {
    Task recurringTask =
        Task.builder()
            .id(7L)
            .title("Finish report")
            .description("Prepare monthly summary")
            .priority(TaskPriority.HIGH)
            .recurrencePattern(TaskRecurrence.WEEKLY)
            .deadline(LocalDate.of(2026, 5, 20))
            .category(category)
            .status(TaskStatus.IN_PROGRESS)
            .build();

    TaskRequestDTO doneRequest =
        TaskRequestDTO.builder()
            .title("Finish report")
            .description("Prepare monthly summary")
            .priority(TaskPriority.HIGH)
            .recurrencePattern(TaskRecurrence.WEEKLY)
            .deadline(LocalDate.of(2026, 5, 20))
            .categoryId(11L)
            .status(TaskStatus.DONE)
            .build();

    Task completedTask =
        Task.builder()
            .id(7L)
            .title("Finish report")
            .description("Prepare monthly summary")
            .priority(TaskPriority.HIGH)
            .recurrencePattern(TaskRecurrence.WEEKLY)
            .deadline(LocalDate.of(2026, 5, 20))
            .category(category)
            .status(TaskStatus.DONE)
            .build();

    Task nextOccurrence =
        Task.builder()
            .title("Finish report")
            .description("Prepare monthly summary")
            .priority(TaskPriority.HIGH)
            .recurrencePattern(TaskRecurrence.WEEKLY)
            .deadline(LocalDate.of(2026, 5, 27))
            .category(category)
            .status(TaskStatus.TODO)
            .build();

    TaskResponseDTO completedResponse =
        TaskResponseDTO.builder()
            .id(7L)
            .title("Finish report")
            .description("Prepare monthly summary")
            .priority(TaskPriority.HIGH)
            .recurrencePattern(TaskRecurrence.WEEKLY)
            .deadline(LocalDate.of(2026, 5, 20))
            .category(
                CategoryResponseDTO.builder()
                    .id(11L)
                    .name("Work")
                    .description("Work tasks")
                    .build())
            .status(TaskStatus.DONE)
            .build();

    when(taskRepository.findById(7L)).thenReturn(Optional.of(recurringTask));
    when(categoryRepository.findById(11L)).thenReturn(Optional.of(category));
    when(taskMapper.updateEntity(doneRequest, recurringTask)).thenReturn(completedTask);
    when(taskRepository.save(any(Task.class)))
        .thenAnswer(
            invocation -> {
              Task savedTask = invocation.getArgument(0);
              if (savedTask.getStatus() == TaskStatus.DONE) {
                return completedTask;
              }
              return nextOccurrence;
            });
    when(taskMapper.toResponseDTO(completedTask)).thenReturn(completedResponse);

    TaskResponseDTO result = taskService.updateTask(7L, doneRequest);

    assertThat(result).isEqualTo(completedResponse);
    verify(taskRepository, times(2)).save(taskCaptor.capture());
    assertThat(taskCaptor.getAllValues()).hasSize(2);
    assertThat(taskCaptor.getAllValues().get(1).getDeadline()).isEqualTo(LocalDate.of(2026, 5, 27));
    assertThat(taskCaptor.getAllValues().get(1).getStatus()).isEqualTo(TaskStatus.TODO);
  }

  @Test
  void updateTaskShouldThrowWhenTaskMissing() {
    when(taskRepository.findById(7L)).thenReturn(Optional.empty());

    assertThatThrownBy(() -> taskService.updateTask(7L, request))
        .isInstanceOf(TaskNotFoundException.class)
        .hasMessage("Task not found with id: 7");

    verify(categoryRepository, never()).findById(any());
  }

  @Test
  void deleteTaskShouldDeleteExistingTask() {
    when(taskRepository.existsById(7L)).thenReturn(true);

    taskService.deleteTask(7L);

    verify(taskRepository).deleteById(7L);
  }

  @Test
  void deleteTaskShouldThrowWhenTaskMissing() {
    when(taskRepository.existsById(7L)).thenReturn(false);

    assertThatThrownBy(() -> taskService.deleteTask(7L))
        .isInstanceOf(TaskNotFoundException.class)
        .hasMessage("Task not found with id: 7");

    verify(taskRepository, never()).deleteById(any());
  }
}
