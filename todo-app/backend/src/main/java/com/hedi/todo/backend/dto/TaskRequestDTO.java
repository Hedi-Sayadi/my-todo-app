package com.hedi.todo.backend.dto;

import com.hedi.todo.backend.entity.TaskPriority;
import com.hedi.todo.backend.entity.TaskRecurrence;
import com.hedi.todo.backend.entity.TaskStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for creating or updating a Task.
 *
 * <p>This DTO is used for incoming requests from the client. It includes validation constraints to
 * ensure data integrity.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaskRequestDTO {

  @NotBlank(message = "Task title cannot be blank")
  private String title;

  private String description;

  @NotNull(message = "Task priority is required")
  private TaskPriority priority;

  private TaskRecurrence recurrencePattern = TaskRecurrence.NONE;

  private LocalDate deadline;

  @NotNull(message = "Task category is required")
  private Long categoryId;

  @NotNull(message = "Task status is required")
  private TaskStatus status;
}
