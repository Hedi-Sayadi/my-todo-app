package com.hedi.todo.backend.dto;

import java.time.LocalDateTime;

import com.hedi.todo.backend.entity.UserRole;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResponseDTO {

	private Long id;

	private String firstName;

	private String lastName;

	private String email;

	private UserRole role;

	private LocalDateTime createdAt;

	private LocalDateTime updatedAt;
}