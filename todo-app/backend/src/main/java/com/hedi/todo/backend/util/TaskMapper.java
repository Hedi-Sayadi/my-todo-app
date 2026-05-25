package com.hedi.todo.backend.util;

import com.hedi.todo.backend.dto.TaskRequestDTO;
import com.hedi.todo.backend.dto.TaskResponseDTO;
import com.hedi.todo.backend.entity.Task;
import com.hedi.todo.backend.entity.TaskRecurrence;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/**
 * Mapper component for converting between Task entity and DTOs.
 *
 * <p>This utility class handles the transformation of Task entities to/from their corresponding
 * DTOs.
 */
@Component
@RequiredArgsConstructor
public class TaskMapper {
  private final CategoryMapper categoryMapper;

  /**
   * Converts a Task entity to a TaskResponseDTO.
   *
   * @param task the Task entity to convert
   * @return the corresponding TaskResponseDTO
   */
  public TaskResponseDTO toResponseDTO(Task task) {
    return TaskResponseDTO.builder()
        .id(task.getId())
        .title(task.getTitle())
        .description(task.getDescription())
        .priority(task.getPriority())
        .recurrencePattern(
            task.getRecurrencePattern() != null ? task.getRecurrencePattern() : TaskRecurrence.NONE)
        .deadline(task.getDeadline())
        .category(
            task.getCategory() != null ? categoryMapper.toResponseDTO(task.getCategory()) : null)
        .status(task.getStatus())
        .createdAt(task.getCreatedAt())
        .updatedAt(task.getUpdatedAt())
        .build();
  }

  /**
   * Converts a TaskRequestDTO to a Task entity. Note: The category entity must be set by the
   * service layer using categoryId.
   *
   * @param requestDTO the TaskRequestDTO to convert
   * @return a new Task entity with values from the DTO
   */
  public Task toEntity(TaskRequestDTO requestDTO) {
    return Task.builder()
        .title(requestDTO.getTitle())
        .description(requestDTO.getDescription())
        .priority(requestDTO.getPriority())
        .recurrencePattern(
            requestDTO.getRecurrencePattern() != null
                ? requestDTO.getRecurrencePattern()
                : TaskRecurrence.NONE)
        .deadline(requestDTO.getDeadline())
        .status(requestDTO.getStatus())
        .build();
  }

  /**
   * Updates an existing Task entity with values from a TaskRequestDTO. Note: The category entity
   * must be set by the service layer using categoryId.
   *
   * @param requestDTO the TaskRequestDTO containing updated values
   * @param task the Task entity to update
   * @return the updated Task entity
   */
  public Task updateEntity(TaskRequestDTO requestDTO, Task task) {
    task.setTitle(requestDTO.getTitle());
    task.setDescription(requestDTO.getDescription());
    task.setPriority(requestDTO.getPriority());
    task.setRecurrencePattern(
        requestDTO.getRecurrencePattern() != null
            ? requestDTO.getRecurrencePattern()
            : TaskRecurrence.NONE);
    task.setDeadline(requestDTO.getDeadline());
    task.setStatus(requestDTO.getStatus());
    return task;
  }
}
