package com.hedi.todo.backend.exception;

/**
 * Exception thrown when a requested category is not found in the database.
 *
 * <p>This is a runtime exception that indicates a client attempted to access a non-existent
 * category resource.
 */
public class CategoryNotFoundException extends RuntimeException {
  /** The ID of the category that was not found. May be null if not applicable. */
  private Long categoryId;

  /**
   * Constructs a CategoryNotFoundException with a message.
   *
   * @param message a description of what category was not found
   */
  public CategoryNotFoundException(String message) {
    super(message);
  }

  /**
   * Constructs a CategoryNotFoundException with a message and category ID.
   *
   * @param message a description of what category was not found
   * @param categoryId the ID of the missing category
   */
  public CategoryNotFoundException(String message, Long categoryId) {
    super(message);
    this.categoryId = categoryId;
  }

  /**
   * Constructs a CategoryNotFoundException with a message and cause.
   *
   * @param message a description of what category was not found
   * @param cause the underlying exception that caused this
   */
  public CategoryNotFoundException(String message, Throwable cause) {
    super(message, cause);
  }

  /**
   * Gets the ID of the category that was not found.
   *
   * @return the category ID, or null if not set
   */
  public Long getCategoryId() {
    return categoryId;
  }
}
