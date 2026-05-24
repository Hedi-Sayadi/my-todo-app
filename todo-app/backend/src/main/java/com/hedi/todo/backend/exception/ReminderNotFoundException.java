package com.hedi.todo.backend.exception;

/** Exception thrown when a Reminder is not found in the database. */
public class ReminderNotFoundException extends RuntimeException {

  public ReminderNotFoundException(String message) {
    super(message);
  }

  public ReminderNotFoundException(Long reminderId) {
    super("Reminder not found with id: " + reminderId);
  }
}
