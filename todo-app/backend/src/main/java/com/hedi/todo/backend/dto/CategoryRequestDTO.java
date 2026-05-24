package com.hedi.todo.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for creating or updating a Category.
 *
 * <p>This DTO is used for incoming requests from the client. It includes validation constraints to
 * ensure data integrity.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CategoryRequestDTO {
  /** The name of the category. Must be non-blank and unique. */
  @NotBlank(message = "Category name cannot be blank")
  private String name;

  /** Optional description of the category. */
  private String description;
}
