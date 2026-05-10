package com.hedi.todo.backend.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.hedi.todo.backend.entity.TaskPriority;
import com.hedi.todo.backend.entity.TaskStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for returning Task data in responses.
 * 
 * This DTO is used for outgoing responses sent to the client.
 * It includes all fields including timestamps which are set by the server.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaskResponseDTO {

	private Long id;

	private String title;

	private String description;

	private TaskPriority priority;

	private LocalDate deadline;

	private String category;

	private TaskStatus status;

	private LocalDateTime createdAt;

	private LocalDateTime updatedAt;

}

