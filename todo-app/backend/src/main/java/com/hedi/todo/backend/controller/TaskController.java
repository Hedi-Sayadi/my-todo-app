package com.hedi.todo.backend.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.hedi.todo.backend.dto.TaskRequestDTO;
import com.hedi.todo.backend.dto.TaskResponseDTO;
import com.hedi.todo.backend.entity.TaskStatus;
import com.hedi.todo.backend.service.TaskService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

/**
 * REST Controller for Task operations.
 * 
 * This controller handles all HTTP requests related to tasks.
 * All endpoints use proper HTTP status codes and REST conventions.
 */
@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
public class TaskController {

	private final TaskService taskService;

	/**
	 * Creates a new task.
	 *
	 * @param requestDTO the task data to create
	 * @return 201 Created status with the created task
	 */
	@PostMapping
	public ResponseEntity<TaskResponseDTO> createTask(@Valid @RequestBody TaskRequestDTO requestDTO) {
		TaskResponseDTO createdTask = taskService.createTask(requestDTO);
		return ResponseEntity.status(HttpStatus.CREATED).body(createdTask);
	}

	/**
	 * Retrieves a task by ID.
	 *
	 * @param id the task ID
	 * @return 200 OK with the task data
	 */
	@GetMapping("/{id}")
	public ResponseEntity<TaskResponseDTO> getTask(@PathVariable Long id) {
		TaskResponseDTO task = taskService.getTaskById(id);
		return ResponseEntity.ok(task);
	}

	/**
	 * Retrieves all tasks.
	 *
	 * @return 200 OK with list of all tasks
	 */
	@GetMapping
	public ResponseEntity<List<TaskResponseDTO>> getAllTasks() {
		List<TaskResponseDTO> tasks = taskService.getAllTasks();
		return ResponseEntity.ok(tasks);
	}

	/**
	 * Retrieves tasks filtered by status.
	 *
	 * @param status the task status to filter by
	 * @return 200 OK with filtered task list
	 */
	@GetMapping("/status/{status}")
	public ResponseEntity<List<TaskResponseDTO>> getTasksByStatus(@PathVariable TaskStatus status) {
		List<TaskResponseDTO> tasks = taskService.getTasksByStatus(status);
		return ResponseEntity.ok(tasks);
	}

	/**
	 * Retrieves tasks filtered by category.
	 *
	 * @param categoryId the category ID
	 * @return 200 OK with filtered task list
	 */
	@GetMapping("/category/{categoryId}")
	public ResponseEntity<List<TaskResponseDTO>> getTasksByCategory(@PathVariable Long categoryId) {
		List<TaskResponseDTO> tasks = taskService.getTasksByCategory(categoryId);
		return ResponseEntity.ok(tasks);
	}

	/**
	 * Searches for tasks by keyword.
	 *
	 * @param keyword the search keyword
	 * @return 200 OK with matching tasks
	 */
	@GetMapping("/search")
	public ResponseEntity<List<TaskResponseDTO>> searchTasks(@RequestParam String keyword) {
		List<TaskResponseDTO> tasks = taskService.searchTasks(keyword);
		return ResponseEntity.ok(tasks);
	}

	/**
	 * Updates an existing task.
	 *
	 * @param id the task ID
	 * @param requestDTO the updated task data
	 * @return 200 OK with the updated task
	 */
	@PutMapping("/{id}")
	public ResponseEntity<TaskResponseDTO> updateTask(@PathVariable Long id, @Valid @RequestBody TaskRequestDTO requestDTO) {
		TaskResponseDTO updatedTask = taskService.updateTask(id, requestDTO);
		return ResponseEntity.ok(updatedTask);
	}

	/**
	 * Deletes a task by ID.
	 *
	 * @param id the task ID
	 * @return 204 No Content status
	 */
	@DeleteMapping("/{id}")
	public ResponseEntity<Void> deleteTask(@PathVariable Long id) {
		taskService.deleteTask(id);
		return ResponseEntity.noContent().build();
	}

}
