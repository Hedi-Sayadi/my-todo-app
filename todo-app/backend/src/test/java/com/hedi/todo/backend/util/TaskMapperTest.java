package com.hedi.todo.backend.util;

import static org.assertj.core.api.Assertions.assertThat;

import com.hedi.todo.backend.dto.TaskRequestDTO;
import com.hedi.todo.backend.dto.TaskResponseDTO;
import com.hedi.todo.backend.entity.Category;
import com.hedi.todo.backend.entity.Task;
import com.hedi.todo.backend.entity.TaskPriority;
import com.hedi.todo.backend.entity.TaskStatus;
import java.time.LocalDate;
import org.junit.jupiter.api.Test;

public class TaskMapperTest {

  private final CategoryMapper categoryMapper = new CategoryMapper();
  private final TaskMapper mapper = new TaskMapper(categoryMapper);

  @Test
  void toResponseDTO_withCategory_mapsCategory() {
    Category c = Category.builder().id(3L).name("C").build();
    Task t =
        Task.builder()
            .id(5L)
            .title("T")
            .description("d")
            .priority(TaskPriority.MEDIUM)
            .deadline(LocalDate.of(2026, 1, 1))
            .category(c)
            .status(TaskStatus.TODO)
            .build();

    TaskResponseDTO dto = mapper.toResponseDTO(t);

    assertThat(dto).isNotNull();
    assertThat(dto.getId()).isEqualTo(5L);
    assertThat(dto.getCategory()).isNotNull();
    assertThat(dto.getCategory().getId()).isEqualTo(3L);
  }

  @Test
  void toResponseDTO_nullCategory_returnsNullCategory() {
    Task t = Task.builder().id(1L).title("T").build();
    TaskResponseDTO dto = mapper.toResponseDTO(t);
    assertThat(dto.getCategory()).isNull();
  }

  @Test
  void toEntity_mapsFields() {
    TaskRequestDTO req =
        TaskRequestDTO.builder()
            .title("Title")
            .description("Desc")
            .priority(TaskPriority.HIGH)
            .deadline(LocalDate.of(2026, 5, 1))
            .status(TaskStatus.TODO)
            .build();

    Task entity = mapper.toEntity(req);

    assertThat(entity).isNotNull();
    assertThat(entity.getTitle()).isEqualTo("Title");
    assertThat(entity.getPriority()).isEqualTo(TaskPriority.HIGH);
    assertThat(entity.getDeadline()).isEqualTo(LocalDate.of(2026, 5, 1));
  }

  @Test
  void updateEntity_appliesChanges() {
    Task t =
        Task.builder()
            .title("Old")
            .description("old")
            .priority(TaskPriority.LOW)
            .status(TaskStatus.TODO)
            .build();
    TaskRequestDTO req =
        TaskRequestDTO.builder()
            .title("New")
            .description("new")
            .priority(TaskPriority.HIGH)
            .status(TaskStatus.DONE)
            .build();
    mapper.updateEntity(req, t);
    assertThat(t.getTitle()).isEqualTo("New");
    assertThat(t.getPriority()).isEqualTo(TaskPriority.HIGH);
    assertThat(t.getStatus()).isEqualTo(TaskStatus.DONE);
  }
}
