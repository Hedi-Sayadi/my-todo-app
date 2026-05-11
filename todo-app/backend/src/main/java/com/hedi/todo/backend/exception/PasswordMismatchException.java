package com.hedi.todo.backend.exception;

public class PasswordMismatchException extends RuntimeException {

	public PasswordMismatchException() {
		super("Passwords do not match");
	}
}