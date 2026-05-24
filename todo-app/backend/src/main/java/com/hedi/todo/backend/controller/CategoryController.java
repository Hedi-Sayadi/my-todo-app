package com.hedi.todo.backend.controller;

import com.hedi.todo.backend.dto.CategoryRequestDTO;
import com.hedi.todo.backend.dto.CategoryResponseDTO;
import com.hedi.todo.backend.service.CategoryService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST Controller for Category operations.
 *
 * <p>This controller handles all HTTP requests related to categories. All endpoints use proper HTTP
 * status codes and REST conventions.
 */
@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {
  /** Service for category business logic operations. */
  private final CategoryService categoryService;

  /**
   * Creates a new category.
   *
   * @param requestDTO the category data to create
   * @return 201 Created status with the created category
   * @throws IllegalArgumentException if a category with the same name already exists
   */
  @PostMapping
  public ResponseEntity<CategoryResponseDTO> createCategory(
      @Valid @RequestBody CategoryRequestDTO requestDTO) {
    CategoryResponseDTO createdCategory = categoryService.createCategory(requestDTO);
    return ResponseEntity.status(HttpStatus.CREATED).body(createdCategory);
  }

  /**
   * Retrieves all categories.
   *
   * @return 200 OK with list of all categories
   */
  @GetMapping
  public ResponseEntity<List<CategoryResponseDTO>> getAllCategories() {
    List<CategoryResponseDTO> categories = categoryService.getAllCategories();
    return ResponseEntity.ok(categories);
  }

  /**
   * Retrieves a category by ID.
   *
   * @param id the category ID
   * @return 200 OK with the category data
   * @throws CategoryNotFoundException if the category is not found
   */
  @GetMapping("/{id}")
  public ResponseEntity<CategoryResponseDTO> getCategoryById(@PathVariable Long id) {
    CategoryResponseDTO category = categoryService.getCategoryById(id);
    return ResponseEntity.ok(category);
  }

  /**
   * Retrieves a category by name.
   *
   * @param name the category name to search for
   * @return 200 OK with the category data
   * @throws CategoryNotFoundException if no category with the given name exists
   */
  @GetMapping("/name/{name}")
  public ResponseEntity<CategoryResponseDTO> getCategoryByName(@PathVariable String name) {
    CategoryResponseDTO category = categoryService.getCategoryByName(name);
    return ResponseEntity.ok(category);
  }

  /**
   * Updates an existing category.
   *
   * @param id the category ID
   * @param requestDTO the updated category data
   * @return 200 OK with the updated category
   * @throws CategoryNotFoundException if the category is not found
   * @throws IllegalArgumentException if the new name conflicts with another category
   */
  @PutMapping("/{id}")
  public ResponseEntity<CategoryResponseDTO> updateCategory(
      @PathVariable Long id, @Valid @RequestBody CategoryRequestDTO requestDTO) {
    CategoryResponseDTO updatedCategory = categoryService.updateCategory(id, requestDTO);
    return ResponseEntity.ok(updatedCategory);
  }

  /**
   * Deletes a category by ID.
   *
   * @param id the category ID
   * @return 204 No Content status
   * @throws CategoryNotFoundException if the category is not found
   * @throws IllegalArgumentException if the category has associated tasks
   */
  @DeleteMapping("/{id}")
  public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
    categoryService.deleteCategory(id);
    return ResponseEntity.noContent().build();
  }
}
