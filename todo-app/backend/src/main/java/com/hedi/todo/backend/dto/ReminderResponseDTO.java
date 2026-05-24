package com.hedi.todo.backend.dto;

import com.hedi.todo.backend.entity.ReminderStatus;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/** DTO for returning Reminder data in responses. */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReminderResponseDTO {

  private Long id;

  private TaskResponseDTO task;

  private LocalDateTime reminderAt;

  private String note;

  private ReminderStatus status;

  private LocalDateTime snoozeUntil;

  private LocalDateTime createdAt;

  private LocalDateTime updatedAt;
}
