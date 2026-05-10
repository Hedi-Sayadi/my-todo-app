package com.hedi.todo.backend.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.hedi.todo.backend.dto.TaskRequestDTO;
import com.hedi.todo.backend.dto.TaskResponseDTO;
import com.hedi.todo.backend.entity.Task;
import com.hedi.todo.backend.entity.TaskStatus;
import com.hedi.todo.backend.exception.TaskNotFoundException;
import com.hedi.todo.backend.repository.TaskRepository;
import com.hedi.todo.backend.util.TaskMapper;

import lombok.RequiredArgsConstructor;

/**
 * Service layer for Task business logic.
 * 
 * This service provides CRUD operations and additional business logic
 * for Task entities. It handles the conversion between DTOs and entities.
 */
@Service
@RequiredArgsConstructor
@Transactional
public class TaskService {

	private final TaskRepository taskRepository;
	private final TaskMapper taskMapper;

	/**
	 * Creates a new task.
	 *
	 * @param requestDTO the task data
	 * @return the created task as ResponseDTO
	 */
	public TaskResponseDTO createTask(TaskRequestDTO requestDTO) {
		Task task = taskMapper.toEntity(requestDTO);
		Task savedTask = taskRepository.save(task);
		return taskMapper.toResponseDTO(savedTask);
	}

	/**
	 * Gets a task by its ID.
	 *
	 * @param id the task ID
	 * @return the task as ResponseDTO
	 * @throws TaskNotFoundException if the task is not found
	 */
	@Transactional(readOnly = true)
	public TaskResponseDTO getTaskById(Long id) {
		Task task = taskRepository.findById(id)
			.orElseThrow(() -> new TaskNotFoundException(id));
		return taskMapper.toResponseDTO(task);
	}

	/**
	 * Gets all tasks.
	 *
	 * @return list of all tasks as ResponseDTOs
	 */
	@Transactional(readOnly = true)
	public List<TaskResponseDTO> getAllTasks() {
		return taskRepository.findAll()
			.stream()
			.map(taskMapper::toResponseDTO)
			.collect(Collectors.toList());
	}

	/**
	 * Gets all tasks with a specific status.
	 *
	 * @param status the task status to filter by
	 * @return list of tasks with the specified status
	 */
	@Transactional(readOnly = true)
	public List<TaskResponseDTO> getTasksByStatus(TaskStatus status) {
		return taskRepository.findByStatus(status)
			.stream()
			.map(taskMapper::toResponseDTO)
			.collect(Collectors.toList());
	}

	/**
	 * Gets all tasks in a specific category.
	 *
	 * @param category the category name
	 * @return list of tasks in the specified category
	 */
	@Transactional(readOnly = true)
	public List<TaskResponseDTO> getTasksByCategory(String category) {
		return taskRepository.findByCategory(category)
			.stream()
			.map(taskMapper::toResponseDTO)
			.collect(Collectors.toList());
	}

	/**
	 * Searches for tasks by keyword in title or description.
	 *
	 * @param keyword the search keyword
	 * @return list of matching tasks
	 */
	@Transactional(readOnly = true)
	public List<TaskResponseDTO> searchTasks(String keyword) {
		return taskRepository.findByTitleContainingIgnoreCaseOrDescriptionContainingIgnoreCase(keyword, keyword)
			.stream()
			.map(taskMapper::toResponseDTO)
			.collect(Collectors.toList());
	}

	/**
	 * Updates an existing task.
	 *
	 * @param id the task ID
	 * @param requestDTO the updated task data
	 * @return the updated task as ResponseDTO
	 * @throws TaskNotFoundException if the task is not found
	 */
	public TaskResponseDTO updateTask(Long id, TaskRequestDTO requestDTO) {
		Task task = taskRepository.findById(id)
			.orElseThrow(() -> new TaskNotFoundException(id));
		
		Task updatedTask = taskMapper.updateEntity(requestDTO, task);
		Task savedTask = taskRepository.save(updatedTask);
		return taskMapper.toResponseDTO(savedTask);
	}

	/**
	 * Deletes a task by its ID.
	 *
	 * @param id the task ID
	 * @throws TaskNotFoundException if the task is not found
	 */
	public void deleteTask(Long id) {
		if (!taskRepository.existsById(id)) {
			throw new TaskNotFoundException(id);
		}
		taskRepository.deleteById(id);
	}

}
