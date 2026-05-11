package com.hedi.todo.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponseDTO {

	private String token;

	@Builder.Default
	private String tokenType = "Bearer";

	private long expiresInMillis;

	private UserResponseDTO user;
}