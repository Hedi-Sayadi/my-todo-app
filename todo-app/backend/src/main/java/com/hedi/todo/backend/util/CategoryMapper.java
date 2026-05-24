package com.hedi.todo.backend.util;

import com.hedi.todo.backend.dto.CategoryRequestDTO;
import com.hedi.todo.backend.dto.CategoryResponseDTO;
import com.hedi.todo.backend.entity.Category;
import org.springframework.stereotype.Component;

/**
 * Mapper component for converting between Category entity and DTOs.
 *
 * <p>This utility class handles the transformation of Category entities to/from their corresponding
 * DTOs.
 */
@Component
public class CategoryMapper {

  /**
   * Converts a Category entity to a CategoryResponseDTO.
   *
   * @param category the Category entity to convert
   * @return the corresponding CategoryResponseDTO, or null if input is null
   */
  public CategoryResponseDTO toResponseDTO(Category category) {
    if (category == null) {
      return null;
    }

    return CategoryResponseDTO.builder()
        .id(category.getId())
        .name(category.getName())
        .description(category.getDescription())
        .createdAt(category.getCreatedAt())
        .updatedAt(category.getUpdatedAt())
        .build();
  }

  /**
   * Converts a CategoryRequestDTO to a Category entity.
   *
   * @param requestDTO the CategoryRequestDTO to convert
   * @return a new Category entity with values from the DTO, or null if input is null
   */
  public Category toEntity(CategoryRequestDTO requestDTO) {
    if (requestDTO == null) {
      return null;
    }

    return Category.builder()
        .name(requestDTO.getName())
        .description(requestDTO.getDescription())
        .build();
  }

  /**
   * Updates an existing Category entity with values from a CategoryRequestDTO.
   *
   * @param requestDTO the CategoryRequestDTO containing updated values
   * @param category the Category entity to update
   */
  public void updateEntity(CategoryRequestDTO requestDTO, Category category) {
    if (requestDTO == null) {
      return;
    }

    category.setName(requestDTO.getName());
    category.setDescription(requestDTO.getDescription());
  }
}
