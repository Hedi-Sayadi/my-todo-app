package com.hedi.todo.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.hedi.todo.backend.dto.ReminderRequestDTO;
import com.hedi.todo.backend.dto.ReminderResponseDTO;
import com.hedi.todo.backend.dto.ReminderSnoozeRequestDTO;
import com.hedi.todo.backend.entity.ReminderStatus;
import com.hedi.todo.backend.service.ReminderService;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.LocalDateTime;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.mock;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

public class ReminderControllerTest {

    private final ReminderService reminderService = mock(ReminderService.class);
    private final ReminderController controller = new ReminderController(reminderService);
    private final MockMvc mvc = MockMvcBuilders.standaloneSetup(controller).build();
    private final ObjectMapper objectMapper = new ObjectMapper().registerModule(new JavaTimeModule());

    @Test
    void createReminder_returnsCreated() throws Exception {
        ReminderRequestDTO req = ReminderRequestDTO.builder()
                .taskId(1L)
                .reminderAt(LocalDateTime.of(2026,5,20,10,0))
                .note("n")
                .status(ReminderStatus.PENDING)
                .build();

        ReminderResponseDTO resp = ReminderResponseDTO.builder().id(2L).note("n").build();
        given(reminderService.createReminder(any(ReminderRequestDTO.class))).willReturn(resp);

        mvc.perform(post("/api/reminders")
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

        mvc.perform(put("/api/reminders/3/snooze")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(snooze)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(3));
    }
}
