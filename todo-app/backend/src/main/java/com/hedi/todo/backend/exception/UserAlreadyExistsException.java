package com.hedi.todo.backend.exception;

public class UserAlreadyExistsException extends RuntimeException {

	public UserAlreadyExistsException(String email) {
		super("A user with this email already exists: " + email);
	}
}