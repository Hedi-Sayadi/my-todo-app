package com.hedi.todo.backend.controller;

import com.hedi.todo.backend.dto.ReminderRequestDTO;
import com.hedi.todo.backend.dto.ReminderResponseDTO;
import com.hedi.todo.backend.dto.ReminderSnoozeRequestDTO;
import com.hedi.todo.backend.service.ReminderService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** REST Controller for Reminder operations. */
@RestController
@RequestMapping("/api/reminders")
@RequiredArgsConstructor
public class ReminderController {

  private final ReminderService reminderService;

  @PostMapping
  public ResponseEntity<ReminderResponseDTO> createReminder(
      @Valid @RequestBody ReminderRequestDTO requestDTO) {
    ReminderResponseDTO createdReminder = reminderService.createReminder(requestDTO);
    return ResponseEntity.status(HttpStatus.CREATED).body(createdReminder);
  }

  @GetMapping
  public ResponseEntity<List<ReminderResponseDTO>> getAllReminders() {
    return ResponseEntity.ok(reminderService.getAllReminders());
  }

  @GetMapping("/{id}")
  public ResponseEntity<ReminderResponseDTO> getReminderById(@PathVariable Long id) {
    return ResponseEntity.ok(reminderService.getReminderById(id));
  }

  @PutMapping("/{id}")
  public ResponseEntity<ReminderResponseDTO> updateReminder(
      @PathVariable Long id, @Valid @RequestBody ReminderRequestDTO requestDTO) {
    return ResponseEntity.ok(reminderService.updateReminder(id, requestDTO));
  }

  @PutMapping("/{id}/snooze")
  public ResponseEntity<ReminderResponseDTO> snoozeReminder(
      @PathVariable Long id, @Valid @RequestBody ReminderSnoozeRequestDTO requestDTO) {
    return ResponseEntity.ok(reminderService.snoozeReminder(id, requestDTO.getMinutes()));
  }

  @PutMapping("/{id}/done")
  public ResponseEntity<ReminderResponseDTO> markReminderDone(@PathVariable Long id) {
    return ResponseEntity.ok(reminderService.markReminderDone(id));
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> deleteReminder(@PathVariable Long id) {
    reminderService.deleteReminder(id);
    return ResponseEntity.noContent().build();
  }
}
