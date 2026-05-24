package com.hedi.todo.backend.service;

import com.hedi.todo.backend.dto.CategoryRequestDTO;
import com.hedi.todo.backend.dto.CategoryResponseDTO;
import com.hedi.todo.backend.entity.Category;
import com.hedi.todo.backend.exception.CategoryNotFoundException;
import com.hedi.todo.backend.repository.CategoryRepository;
import com.hedi.todo.backend.util.CategoryMapper;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service layer for Category business logic.
 *
 * <p>This service provides CRUD operations and additional business logic for Category entities. It
 * handles the conversion between DTOs and entities, as well as business rule enforcement like
 * duplicate name prevention.
 */
@Service
@Transactional
@RequiredArgsConstructor
public class CategoryService {
  /** Repository for category persistence operations. */
  private final CategoryRepository categoryRepository;
  /** Mapper for entity-to-DTO conversions. */
  private final CategoryMapper categoryMapper;

  public CategoryResponseDTO createCategory(CategoryRequestDTO requestDTO) {
    // Check for duplicate name
    if (categoryRepository.existsByName(requestDTO.getName())) {
      throw new IllegalArgumentException(
          "Category with name '" + requestDTO.getName() + "' already exists");
    }

    Category category = categoryMapper.toEntity(requestDTO);
    Category savedCategory = categoryRepository.save(category);
    return categoryMapper.toResponseDTO(savedCategory);
  }

  @Transactional(readOnly = true)
  public CategoryResponseDTO getCategoryById(Long id) {
    Category category =
        categoryRepository
            .findById(id)
            .orElseThrow(
                () -> new CategoryNotFoundException("Category not found with id: " + id, id));
    return categoryMapper.toResponseDTO(category);
  }

  @Transactional(readOnly = true)
  public List<CategoryResponseDTO> getAllCategories() {
    return categoryRepository.findAll().stream().map(categoryMapper::toResponseDTO).toList();
  }

  public CategoryResponseDTO updateCategory(Long id, CategoryRequestDTO requestDTO) {
    Category category =
        categoryRepository
            .findById(id)
            .orElseThrow(
                () -> new CategoryNotFoundException("Category not found with id: " + id, id));

    // Check if new name conflicts with another category
    if (!category.getName().equals(requestDTO.getName())
        && categoryRepository.existsByName(requestDTO.getName())) {
      throw new IllegalArgumentException(
          "Category with name '" + requestDTO.getName() + "' already exists");
    }

    categoryMapper.updateEntity(requestDTO, category);
    Category updatedCategory = categoryRepository.save(category);
    return categoryMapper.toResponseDTO(updatedCategory);
  }

  public void deleteCategory(Long id) {
    Category category =
        categoryRepository
            .findById(id)
            .orElseThrow(
                () -> new CategoryNotFoundException("Category not found with id: " + id, id));

    // Check if category has tasks
    if (!category.getTasks().isEmpty()) {
      throw new IllegalArgumentException(
          "Cannot delete category with existing tasks. Please reassign or delete tasks first.");
    }

    categoryRepository.delete(category);
  }

  @Transactional(readOnly = true)
  public CategoryResponseDTO getCategoryByName(String name) {
    Category category =
        categoryRepository
            .findByName(name)
            .orElseThrow(
                () -> new CategoryNotFoundException("Category not found with name: " + name));
    return categoryMapper.toResponseDTO(category);
  }
}
