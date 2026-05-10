package com.hedi.todo.backend.util;

import org.springframework.stereotype.Component;

import com.hedi.todo.backend.dto.TaskRequestDTO;
import com.hedi.todo.backend.dto.TaskResponseDTO;
import com.hedi.todo.backend.entity.Task;

/**
 * Mapper component for converting between Task entity and DTOs.
 * 
 * This utility class handles the transformation of Task entities
 * to/from their corresponding DTOs.
 */
@Component
public class TaskMapper {

	/**
	 * Converts a Task entity to a TaskResponseDTO.
	 *
	 * @param task the Task entity to convert
	 * @return the corresponding TaskResponseDTO
	 */
	public TaskResponseDTO toResponseDTO(Task task) {
		return TaskResponseDTO.builder()
			.id(task.getId())
			.title(task.getTitle())
			.description(task.getDescription())
			.priority(task.getPriority())
			.deadline(task.getDeadline())
			.category(task.getCategory())
			.status(task.getStatus())
			.createdAt(task.getCreatedAt())
			.updatedAt(task.getUpdatedAt())
			.build();
	}

	/**
	 * Converts a TaskRequestDTO to a Task entity.
	 *
	 * @param requestDTO the TaskRequestDTO to convert
	 * @return a new Task entity with values from the DTO
	 */
	public Task toEntity(TaskRequestDTO requestDTO) {
		return Task.builder()
			.title(requestDTO.getTitle())
			.description(requestDTO.getDescription())
			.priority(requestDTO.getPriority())
			.deadline(requestDTO.getDeadline())
			.category(requestDTO.getCategory())
			.status(requestDTO.getStatus())
			.build();
	}

	/**
	 * Updates an existing Task entity with values from a TaskRequestDTO.
	 *
	 * @param requestDTO the TaskRequestDTO containing updated values
	 * @param task the Task entity to update
	 * @return the updated Task entity
	 */
	public Task updateEntity(TaskRequestDTO requestDTO, Task task) {
		task.setTitle(requestDTO.getTitle());
		task.setDescription(requestDTO.getDescription());
		task.setPriority(requestDTO.getPriority());
		task.setDeadline(requestDTO.getDeadline());
		task.setCategory(requestDTO.getCategory());
		task.setStatus(requestDTO.getStatus());
		return task;
	}

}
