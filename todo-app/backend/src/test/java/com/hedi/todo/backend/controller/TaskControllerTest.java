package com.hedi.todo.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hedi.todo.backend.dto.TaskRequestDTO;
import com.hedi.todo.backend.dto.TaskResponseDTO;
import com.hedi.todo.backend.service.TaskService;
import com.hedi.todo.backend.entity.TaskPriority;
import com.hedi.todo.backend.entity.TaskStatus;
import org.junit.jupiter.api.Test;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.LocalDate;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.mock;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

public class TaskControllerTest {

    private final TaskService taskService = mock(TaskService.class);
    private final TaskController controller = new TaskController(taskService);
    private final MockMvc mvc = MockMvcBuilders.standaloneSetup(controller).build();
    private final ObjectMapper objectMapper = new ObjectMapper().registerModule(new JavaTimeModule());

    @Test
    void createTask_returnsCreated() throws Exception {
        TaskRequestDTO req = TaskRequestDTO.builder()
                .title("T")
                .description("d")
                .priority(TaskPriority.MEDIUM)
                .deadline(LocalDate.of(2026,5,20))
                .categoryId(1L)
                .status(TaskStatus.TODO)
                .build();

        TaskResponseDTO resp = TaskResponseDTO.builder().id(10L).title("T").build();
        given(taskService.createTask(any(TaskRequestDTO.class))).willReturn(resp);

        mvc.perform(post("/api/tasks")
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
}
