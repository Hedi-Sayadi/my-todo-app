package com.hedi.todo.backend.service;

import com.hedi.todo.backend.dto.TaskRequestDTO;
import com.hedi.todo.backend.dto.TaskResponseDTO;
import com.hedi.todo.backend.entity.Category;
import com.hedi.todo.backend.entity.Task;
import com.hedi.todo.backend.entity.TaskRecurrence;
import com.hedi.todo.backend.entity.TaskStatus;
import com.hedi.todo.backend.exception.CategoryNotFoundException;
import com.hedi.todo.backend.exception.TaskNotFoundException;
import com.hedi.todo.backend.repository.CategoryRepository;
import com.hedi.todo.backend.repository.TaskRepository;
import com.hedi.todo.backend.util.TaskMapper;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service layer for Task business logic.
 *
 * <p>This service provides CRUD operations and additional business logic for Task entities. It
 * handles the conversion between DTOs and entities.
 */
@Service
@RequiredArgsConstructor
@Transactional
public class TaskService {

  private final TaskRepository taskRepository;
  private final CategoryRepository categoryRepository;
  private final TaskMapper taskMapper;

  /**
   * Creates a new task.
   *
   * @param requestDTO the task data
   * @return the created task as ResponseDTO
   * @throws CategoryNotFoundException if the category is not found
   */
  public TaskResponseDTO createTask(TaskRequestDTO requestDTO) {
    // Load the category
    Category category =
        categoryRepository
            .findById(requestDTO.getCategoryId())
            .orElseThrow(
                () ->
                    new CategoryNotFoundException(
                        "Category not found with id: " + requestDTO.getCategoryId(),
                        requestDTO.getCategoryId()));

    Task task = taskMapper.toEntity(requestDTO);
    task.setCategory(category);
    Task savedTask = taskRepository.save(task);
    return taskMapper.toResponseDTO(savedTask);
  }

  /**
   * Gets a task by its ID.
   *
   * @param id the task ID
   * @return the task as ResponseDTO
   * @throws TaskNotFoundException if the task is not found
   */
  @Transactional(readOnly = true)
  public TaskResponseDTO getTaskById(Long id) {
    Task task = taskRepository.findById(id).orElseThrow(() -> new TaskNotFoundException(id));
    return taskMapper.toResponseDTO(task);
  }

  /**
   * Gets all tasks.
   *
   * @return list of all tasks as ResponseDTOs
   */
  @Transactional(readOnly = true)
  public List<TaskResponseDTO> getAllTasks() {
    return taskRepository.findAll().stream()
        .map(taskMapper::toResponseDTO)
        .collect(Collectors.toList());
  }

  /**
   * Gets all tasks with a specific status.
   *
   * @param status the task status to filter by
   * @return list of tasks with the specified status
   */
  @Transactional(readOnly = true)
  public List<TaskResponseDTO> getTasksByStatus(TaskStatus status) {
    return taskRepository.findByStatus(status).stream()
        .map(taskMapper::toResponseDTO)
        .collect(Collectors.toList());
  }

  /**
   * Gets all tasks in a specific category.
   *
   * @param categoryId the category ID
   * @return list of tasks in the specified category
   * @throws CategoryNotFoundException if the category is not found
   */
  @Transactional(readOnly = true)
  public List<TaskResponseDTO> getTasksByCategory(Long categoryId) {
    Category category =
        categoryRepository
            .findById(categoryId)
            .orElseThrow(
                () ->
                    new CategoryNotFoundException(
                        "Category not found with id: " + categoryId, categoryId));

    return taskRepository.findByCategory(category).stream()
        .map(taskMapper::toResponseDTO)
        .collect(Collectors.toList());
  }

  /**
   * Searches for tasks by keyword in title or description.
   *
   * @param keyword the search keyword
   * @return list of matching tasks
   */
  @Transactional(readOnly = true)
  public List<TaskResponseDTO> searchTasks(String keyword) {
    return taskRepository
        .findByTitleContainingIgnoreCaseOrDescriptionContainingIgnoreCase(keyword, keyword)
        .stream()
        .map(taskMapper::toResponseDTO)
        .collect(Collectors.toList());
  }

  /**
   * Updates an existing task.
   *
   * @param id the task ID
   * @param requestDTO the updated task data
   * @return the updated task as ResponseDTO
   * @throws TaskNotFoundException if the task is not found
   * @throws CategoryNotFoundException if the category is not found
   */
  public TaskResponseDTO updateTask(Long id, TaskRequestDTO requestDTO) {
    Task task = taskRepository.findById(id).orElseThrow(() -> new TaskNotFoundException(id));
    TaskStatus previousStatus = task.getStatus();

    // Update category if categoryId is provided
    Category category =
        categoryRepository
            .findById(requestDTO.getCategoryId())
            .orElseThrow(
                () ->
                    new CategoryNotFoundException(
                        "Category not found with id: " + requestDTO.getCategoryId(),
                        requestDTO.getCategoryId()));
    task.setCategory(category);

    Task updatedTask = taskMapper.updateEntity(requestDTO, task);
    Task savedTask = taskRepository.save(updatedTask);

    if (shouldCreateNextOccurrence(previousStatus, requestDTO)) {
      taskRepository.save(createNextOccurrence(savedTask));
    }

    return taskMapper.toResponseDTO(savedTask);
  }

  /**
   * Deletes a task by its ID.
   *
   * @param id the task ID
   * @throws TaskNotFoundException if the task is not found
   */
  public void deleteTask(Long id) {
    if (!taskRepository.existsById(id)) {
      throw new TaskNotFoundException(id);
    }
    taskRepository.deleteById(id);
  }

  private boolean shouldCreateNextOccurrence(TaskStatus previousStatus, TaskRequestDTO requestDTO) {
    return previousStatus != TaskStatus.DONE
        && requestDTO.getStatus() == TaskStatus.DONE
        && requestDTO.getRecurrencePattern() != TaskRecurrence.NONE;
  }

  private Task createNextOccurrence(Task completedTask) {
    return Task.builder()
        .title(completedTask.getTitle())
        .description(completedTask.getDescription())
        .priority(completedTask.getPriority())
        .recurrencePattern(completedTask.getRecurrencePattern())
        .deadline(
            advanceDeadline(completedTask.getDeadline(), completedTask.getRecurrencePattern()))
        .category(completedTask.getCategory())
        .status(TaskStatus.TODO)
        .build();
  }

  private LocalDate advanceDeadline(LocalDate deadline, TaskRecurrence recurrencePattern) {
    if (deadline == null || recurrencePattern == null) {
      return deadline;
    }

    return switch (recurrencePattern) {
      case DAILY -> deadline.plusDays(1);
      case WEEKLY -> deadline.plusWeeks(1);
      case MONTHLY -> deadline.plusMonths(1);
      case NONE -> deadline;
    };
  }
}
