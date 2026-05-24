package com.hedi.todo.backend.exception;

/** Exception thrown when a reminder already exists for a task. */
public class DuplicateReminderException extends RuntimeException {
  public DuplicateReminderException(Long taskId) {
    super("A reminder already exists for task id: " + taskId);
  }
}
