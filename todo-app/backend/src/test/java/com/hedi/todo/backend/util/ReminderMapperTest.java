package com.hedi.todo.backend.util;

import static org.assertj.core.api.Assertions.assertThat;

import com.hedi.todo.backend.dto.ReminderRequestDTO;
import com.hedi.todo.backend.dto.ReminderResponseDTO;
import com.hedi.todo.backend.entity.Reminder;
import com.hedi.todo.backend.entity.ReminderStatus;
import com.hedi.todo.backend.entity.Task;
import com.hedi.todo.backend.entity.TaskPriority;
import com.hedi.todo.backend.entity.TaskStatus;
import java.time.LocalDateTime;
import org.junit.jupiter.api.Test;

public class ReminderMapperTest {

  private final CategoryMapper categoryMapper = new CategoryMapper();
  private final TaskMapper taskMapper = new TaskMapper(categoryMapper);
  private final ReminderMapper mapper = new ReminderMapper(taskMapper);

  @Test
  void toResponseDTO_null_returnsNull() {
    ReminderResponseDTO dto = mapper.toResponseDTO(null);
    assertThat(dto).isNull();
  }

  @Test
  void toResponseDTO_mapsFields() {
    Task t =
        Task.builder()
            .id(11L)
            .title("Task")
            .priority(TaskPriority.MEDIUM)
            .status(TaskStatus.TODO)
            .build();
    Reminder r =
        Reminder.builder()
            .id(2L)
            .task(t)
            .reminderAt(LocalDateTime.of(2026, 5, 18, 10, 0))
            .note("note")
            .status(ReminderStatus.PENDING)
            .build();

    ReminderResponseDTO dto = mapper.toResponseDTO(r);

    assertThat(dto).isNotNull();
    assertThat(dto.getId()).isEqualTo(2L);
    assertThat(dto.getTask()).isNotNull();
    assertThat(dto.getTask().getId()).isEqualTo(11L);
    assertThat(dto.getNote()).isEqualTo("note");
  }

  @Test
  void toEntity_nullRequest_returnsNull() {
    Reminder entity = mapper.toEntity(null);
    assertThat(entity).isNull();
  }

  @Test
  void toEntity_mapsFields() {
    ReminderRequestDTO req =
        ReminderRequestDTO.builder()
            .taskId(5L)
            .reminderAt(LocalDateTime.of(2026, 6, 1, 9, 0))
            .note("n")
            .status(ReminderStatus.PENDING)
            .build();

    Reminder r = mapper.toEntity(req);
    assertThat(r).isNotNull();
    assertThat(r.getReminderAt()).isEqualTo(LocalDateTime.of(2026, 6, 1, 9, 0));
    assertThat(r.getNote()).isEqualTo("n");
  }

  @Test
  void updateEntity_appliesChanges() {
    Reminder r =
        Reminder.builder()
            .note("old")
            .status(ReminderStatus.PENDING)
            .reminderAt(LocalDateTime.of(2026, 1, 1, 1, 0))
            .build();
    ReminderRequestDTO req =
        ReminderRequestDTO.builder()
            .reminderAt(LocalDateTime.of(2026, 2, 2, 2, 0))
            .note("new")
            .status(ReminderStatus.DONE)
            .build();
    mapper.updateEntity(req, r);
    assertThat(r.getNote()).isEqualTo("new");
    assertThat(r.getStatus()).isEqualTo(ReminderStatus.DONE);
  }
}
