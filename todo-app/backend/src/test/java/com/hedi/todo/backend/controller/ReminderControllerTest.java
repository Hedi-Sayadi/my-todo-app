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
import com.hedi.todo.backend.dto.ReminderRequestDTO;
import com.hedi.todo.backend.dto.ReminderResponseDTO;
import com.hedi.todo.backend.dto.ReminderSnoozeRequestDTO;
import com.hedi.todo.backend.entity.ReminderStatus;
import com.hedi.todo.backend.service.ReminderService;
import java.time.LocalDateTime;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

public class ReminderControllerTest {

  private final ReminderService reminderService = mock(ReminderService.class);
  private final ReminderController controller = new ReminderController(reminderService);
  private final MockMvc mvc = MockMvcBuilders.standaloneSetup(controller).build();
  private final ObjectMapper objectMapper = new ObjectMapper().registerModule(new JavaTimeModule());

  @Test
  void createReminder_returnsCreated() throws Exception {
    ReminderRequestDTO req =
        ReminderRequestDTO.builder()
            .taskId(1L)
            .reminderAt(LocalDateTime.of(2026, 5, 20, 10, 0))
            .note("n")
            .status(ReminderStatus.PENDING)
            .build();

    ReminderResponseDTO resp = ReminderResponseDTO.builder().id(2L).note("n").build();
    given(reminderService.createReminder(any(ReminderRequestDTO.class))).willReturn(resp);

    mvc.perform(
            post("/api/reminders")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.id").value(2));
  }

  @Test
  void snoozeReminder_returnsOk() throws Exception {
    ReminderSnoozeRequestDTO snooze = ReminderSnoozeRequestDTO.builder().minutes(15).build();
    ReminderResponseDTO resp = ReminderResponseDTO.builder().id(3L).build();
    given(reminderService.snoozeReminder(3L, 15)).willReturn(resp);

    mvc.perform(
            put("/api/reminders/3/snooze")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(snooze)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.id").value(3));
  }

  @Test
  void getAllReminders_returnsOk() throws Exception {
    ReminderResponseDTO resp = ReminderResponseDTO.builder().id(4L).build();
    given(reminderService.getAllReminders()).willReturn(List.of(resp));

    mvc.perform(get("/api/reminders"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$[0].id").value(4));
  }

  @Test
  void getReminderById_returnsOk() throws Exception {
    ReminderResponseDTO resp = ReminderResponseDTO.builder().id(5L).build();
    given(reminderService.getReminderById(5L)).willReturn(resp);

    mvc.perform(get("/api/reminders/5"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.id").value(5));
  }

  @Test
  void updateReminder_returnsOk() throws Exception {
    ReminderRequestDTO req =
        ReminderRequestDTO.builder()
            .taskId(2L)
            .reminderAt(LocalDateTime.of(2026, 5, 21, 11, 30))
            .note("updated")
            .status(ReminderStatus.SNOOZED)
            .build();

    ReminderResponseDTO resp = ReminderResponseDTO.builder().id(6L).note("updated").build();
    given(reminderService.updateReminder(eq(6L), any(ReminderRequestDTO.class))).willReturn(resp);

    mvc.perform(
            put("/api/reminders/6")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.id").value(6));
  }

  @Test
  void markReminderDone_returnsOk() throws Exception {
    ReminderResponseDTO resp = ReminderResponseDTO.builder().id(7L).build();
    given(reminderService.markReminderDone(7L)).willReturn(resp);

    mvc.perform(put("/api/reminders/7/done"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.id").value(7));
  }

  @Test
  void deleteReminder_returnsNoContent() throws Exception {
    mvc.perform(delete("/api/reminders/8")).andExpect(status().isNoContent());
  }
}
