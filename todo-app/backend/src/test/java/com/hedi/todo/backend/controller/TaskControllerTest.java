package com.hedi.todo.backend.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.mock;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.hedi.todo.backend.dto.TaskRequestDTO;
import com.hedi.todo.backend.dto.TaskResponseDTO;
import com.hedi.todo.backend.entity.TaskPriority;
import com.hedi.todo.backend.entity.TaskRecurrence;
import com.hedi.todo.backend.entity.TaskStatus;
import com.hedi.todo.backend.service.TaskService;
import java.time.LocalDate;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

public class TaskControllerTest {

  private final TaskService taskService = mock(TaskService.class);
  private final TaskController controller = new TaskController(taskService);
  private final MockMvc mvc = MockMvcBuilders.standaloneSetup(controller).build();
  private final ObjectMapper objectMapper = new ObjectMapper().registerModule(new JavaTimeModule());

  @Test
  void createTask_returnsCreated() throws Exception {
    TaskRequestDTO req =
        TaskRequestDTO.builder()
            .title("T")
            .description("d")
            .priority(TaskPriority.MEDIUM)
            .recurrencePattern(TaskRecurrence.NONE)
            .deadline(LocalDate.of(2026, 5, 20))
            .categoryId(1L)
            .status(TaskStatus.TODO)
            .build();

    TaskResponseDTO resp = TaskResponseDTO.builder().id(10L).title("T").build();
    given(taskService.createTask(any(TaskRequestDTO.class))).willReturn(resp);

    mvc.perform(
            post("/api/tasks")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.id").value(10));
  }

  @Test
  void getTask_returnsOk() throws Exception {
    TaskResponseDTO resp = TaskResponseDTO.builder().id(5L).title("X").build();
    given(taskService.getTaskById(5L)).willReturn(resp);

    mvc.perform(get("/api/tasks/5"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.id").value(5));
  }

  @Test
  void getAllTasks_returnsOk() throws Exception {
    TaskResponseDTO resp = TaskResponseDTO.builder().id(1L).title("One").build();
    given(taskService.getAllTasks()).willReturn(List.of(resp));

    mvc.perform(get("/api/tasks"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$[0].id").value(1));
  }

  @Test
  void getTasksByStatus_returnsOk() throws Exception {
    TaskResponseDTO resp = TaskResponseDTO.builder().id(2L).title("Done").build();
    given(taskService.getTasksByStatus(TaskStatus.DONE)).willReturn(List.of(resp));

    mvc.perform(get("/api/tasks/status/DONE"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$[0].id").value(2));
  }

  @Test
  void getTasksByCategory_returnsOk() throws Exception {
    TaskResponseDTO resp = TaskResponseDTO.builder().id(3L).title("Cat").build();
    given(taskService.getTasksByCategory(9L)).willReturn(List.of(resp));

    mvc.perform(get("/api/tasks/category/9"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$[0].id").value(3));
  }

  @Test
  void searchTasks_returnsOk() throws Exception {
    TaskResponseDTO resp = TaskResponseDTO.builder().id(4L).title("Search result").build();
    given(taskService.searchTasks("budget")).willReturn(List.of(resp));

    mvc.perform(get("/api/tasks/search").param("keyword", "budget"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$[0].id").value(4));
  }

  @Test
  void updateTask_returnsOk() throws Exception {
    TaskRequestDTO req =
        TaskRequestDTO.builder()
            .title("Updated")
            .description("new")
            .priority(TaskPriority.HIGH)
            .recurrencePattern(TaskRecurrence.DAILY)
            .deadline(LocalDate.of(2026, 5, 21))
            .categoryId(2L)
            .status(TaskStatus.IN_PROGRESS)
            .build();

    TaskResponseDTO resp = TaskResponseDTO.builder().id(7L).title("Updated").build();
    given(taskService.updateTask(eq(7L), any(TaskRequestDTO.class))).willReturn(resp);

    mvc.perform(
            put("/api/tasks/7")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.id").value(7));
  }

  @Test
  void deleteTask_returnsNoContent() throws Exception {
    mvc.perform(delete("/api/tasks/11")).andExpect(status().isNoContent());
  }
}
