package com.hedi.todo.backend.config;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Locale;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.hedi.todo.backend.exception.CategoryNotFoundException;
import com.hedi.todo.backend.exception.DuplicateReminderException;
import com.hedi.todo.backend.exception.InvalidCredentialsException;
import com.hedi.todo.backend.exception.PasswordMismatchException;
import com.hedi.todo.backend.exception.ReminderNotFoundException;
import com.hedi.todo.backend.exception.UserAlreadyExistsException;
import com.hedi.todo.backend.exception.TaskNotFoundException;

/**
 * Global exception handler for the application.
 * 
 * This class handles exceptions thrown across all controllers
 * and provides consistent error response formatting.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

	private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

	/**
	 * Handles TaskNotFoundException.
	 *
	 * @param ex the TaskNotFoundException
	 * @return error response with 404 status
	 */
	@ExceptionHandler(TaskNotFoundException.class)
	public ResponseEntity<Map<String, Object>> handleTaskNotFound(TaskNotFoundException ex) {
		Map<String, Object> response = buildErrorResponse(
			HttpStatus.NOT_FOUND,
			ex.getMessage()
		);
		return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
	}

	/**
	 * Handles CategoryNotFoundException.
	 *
	 * @param ex the CategoryNotFoundException
	 * @return error response with 404 status
	 */
	@ExceptionHandler(CategoryNotFoundException.class)
	public ResponseEntity<Map<String, Object>> handleCategoryNotFound(CategoryNotFoundException ex) {
		Map<String, Object> response = buildErrorResponse(
			HttpStatus.NOT_FOUND,
			ex.getMessage()
		);
		return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
	}

	/**
	 * Handles ReminderNotFoundException.
	 *
	 * @param ex the ReminderNotFoundException
	 * @return error response with 404 status
	 */
	@ExceptionHandler(ReminderNotFoundException.class)
	public ResponseEntity<Map<String, Object>> handleReminderNotFound(ReminderNotFoundException ex) {
		Map<String, Object> response = buildErrorResponse(
			HttpStatus.NOT_FOUND,
			ex.getMessage()
		);
		return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
	}

	/**
	 * Handles DuplicateReminderException.
	 *
	 * @param ex the DuplicateReminderException
	 * @return error response with 409 status
	 */
	@ExceptionHandler(DuplicateReminderException.class)
	public ResponseEntity<Map<String, Object>> handleDuplicateReminder(DuplicateReminderException ex) {
		Map<String, Object> response = buildErrorResponse(
			HttpStatus.CONFLICT,
			ex.getMessage()
		);
		return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
	}

	/**
	 * Handles UserAlreadyExistsException.
	 *
	 * @param ex the UserAlreadyExistsException
	 * @return error response with 409 status
	 */
	@ExceptionHandler(UserAlreadyExistsException.class)
	public ResponseEntity<Map<String, Object>> handleUserAlreadyExists(UserAlreadyExistsException ex) {
		Map<String, Object> response = buildErrorResponse(
			HttpStatus.CONFLICT,
			ex.getMessage()
		);
		return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
	}

	/**
	 * Handles PasswordMismatchException.
	 *
	 * @param ex the PasswordMismatchException
	 * @return error response with 400 status
	 */
	@ExceptionHandler(PasswordMismatchException.class)
	public ResponseEntity<Map<String, Object>> handlePasswordMismatch(PasswordMismatchException ex) {
		Map<String, Object> response = buildErrorResponse(
			HttpStatus.BAD_REQUEST,
			ex.getMessage()
		);
		return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
	}

	/**
	 * Handles InvalidCredentialsException.
	 *
	 * @param ex the InvalidCredentialsException
	 * @return error response with 401 status
	 */
	@ExceptionHandler(InvalidCredentialsException.class)
	public ResponseEntity<Map<String, Object>> handleInvalidCredentials(InvalidCredentialsException ex) {
		Map<String, Object> response = buildErrorResponse(
			HttpStatus.UNAUTHORIZED,
			ex.getMessage()
		);
		return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
	}

	/**
	 * Handles IllegalArgumentException for business logic violations.
	 *
	 * @param ex the IllegalArgumentException
	 * @return error response with 400 status
	 */
	@ExceptionHandler(IllegalArgumentException.class)
	public ResponseEntity<Map<String, Object>> handleIllegalArgument(IllegalArgumentException ex) {
		Map<String, Object> response = buildErrorResponse(
			HttpStatus.BAD_REQUEST,
			ex.getMessage()
		);
		return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
	}

	/**
	 * Handles database integrity violations that can surface from unique constraints.
	 *
	 * @param ex the DataIntegrityViolationException
	 * @return error response with 409 status
	 */
	@ExceptionHandler(DataIntegrityViolationException.class)
	public ResponseEntity<Map<String, Object>> handleDataIntegrityViolation(DataIntegrityViolationException ex) {
		String causeMessage = ex.getMostSpecificCause() != null ? ex.getMostSpecificCause().getMessage() : ex.getMessage();
		String normalizedMessage = causeMessage != null ? causeMessage.toLowerCase(Locale.ROOT) : "";
		String message = normalizedMessage.contains("email") || normalizedMessage.contains("users")
			? "A user with this email already exists"
			: "A reminder already exists for this task";
		Map<String, Object> response = buildErrorResponse(
			HttpStatus.CONFLICT,
			message
		);
		return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
	}

	/**
	 * Handles validation errors from @Valid annotation.
	 *
	 * @param ex the MethodArgumentNotValidException
	 * @return error response with 400 status and field errors
	 */
	@ExceptionHandler(MethodArgumentNotValidException.class)
	public ResponseEntity<Map<String, Object>> handleValidationErrors(MethodArgumentNotValidException ex) {
		Map<String, String> fieldErrors = new HashMap<>();
		ex.getBindingResult().getAllErrors().forEach(error -> {
			String fieldName = ((FieldError) error).getField();
			String errorMessage = error.getDefaultMessage();
			fieldErrors.put(fieldName, errorMessage);
		});

		Map<String, Object> response = buildErrorResponse(
			HttpStatus.BAD_REQUEST,
			"Validation failed"
		);
		response.put("errors", fieldErrors);
		return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
	}

	/**
	 * Handles generic exceptions.
	 *
	 * @param ex the Exception
	 * @return error response with 500 status
	 */
	@ExceptionHandler(Exception.class)
	public ResponseEntity<Map<String, Object>> handleGenericException(Exception ex) {
		logger.error("Unhandled exception occurred", ex);
		Map<String, Object> response = buildErrorResponse(
			HttpStatus.INTERNAL_SERVER_ERROR,
			"An unexpected error occurred"
		);
		return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
	}

	/**
	 * Builds a standard error response structure.
	 *
	 * @param status the HTTP status
	 * @param message the error message
	 * @return a map containing the error response data
	 */
	private Map<String, Object> buildErrorResponse(HttpStatus status, String message) {
		Map<String, Object> response = new HashMap<>();
		response.put("timestamp", LocalDateTime.now());
		response.put("status", status.value());
		response.put("error", status.getReasonPhrase());
		response.put("message", message);
		return response;
	}

}
