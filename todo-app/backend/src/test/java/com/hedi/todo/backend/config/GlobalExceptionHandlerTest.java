package com.hedi.todo.backend.config;

import com.hedi.todo.backend.exception.TaskNotFoundException;
import org.junit.jupiter.api.Test;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

public class GlobalExceptionHandlerTest {

    private final GlobalExceptionHandler handler = new GlobalExceptionHandler();

    @Test
    void handleTaskNotFound_returns404() {
        TaskNotFoundException ex = new TaskNotFoundException("not found");
        var resp = handler.handleTaskNotFound(ex);
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        Map<String, Object> body = resp.getBody();
        assertThat(body).containsEntry("message", "not found");
    }

    @Test
    void handleDataIntegrityViolation_userEmailMessage() {
        RuntimeException cause = new RuntimeException("duplicate key value violates unique constraint \"users\"");
        DataIntegrityViolationException ex = new DataIntegrityViolationException("db", cause);
        var resp = handler.handleDataIntegrityViolation(ex);
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
        Map<String, Object> body = resp.getBody();
        assertThat(body.get("message")).isEqualTo("A user with this email already exists");
    }

    @Test
    void handleIllegalArgument_returnsBadRequest() {
        var resp = handler.handleIllegalArgument(new IllegalArgumentException("bad"));
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(resp.getBody()).containsEntry("message", "bad");
    }

    @Test
    void handleGenericException_returns500() {
        var resp = handler.handleGenericException(new RuntimeException("boom"));
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
        assertThat(resp.getBody()).containsEntry("message", "An unexpected error occurred");
    }
}
