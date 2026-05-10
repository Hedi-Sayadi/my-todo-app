package com.hedi.todo.backend.exception;

/**
 * Exception thrown when a Task is not found in the database.
 */
public class TaskNotFoundException extends RuntimeException {

	public TaskNotFoundException(String message) {
		super(message);
	}

	public TaskNotFoundException(String message, Throwable cause) {
		super(message, cause);
	}

	public TaskNotFoundException(Long taskId) {
		super("Task not found with id: " + taskId);
	}

}
