package com.hedi.todo.backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

/**
 * Category entity representing a task category.
 *
 * <p>This entity uses Lombok annotations to reduce boilerplate code. Categories are used to
 * organize and group related tasks.
 */
@Entity
@Table(name = "categories")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Category {
  /** Unique identifier for the category. */
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  /** The name of the category. Must be unique and non-blank. */
  @NotBlank(message = "Category name cannot be blank")
  @Column(nullable = false)
  private String name;

  /** Optional description of the category. */
  @Column(columnDefinition = "TEXT")
  private String description;

  /** Timestamp when the category was created. Set automatically. */
  @CreationTimestamp
  @Column(nullable = false, updatable = false)
  private LocalDateTime createdAt;

  /** Timestamp when the category was last updated. Updated automatically. */
  @UpdateTimestamp
  @Column(nullable = false)
  private LocalDateTime updatedAt;

  /** Set of tasks associated with this category. Lazy-loaded to avoid unnecessary queries. */
  @OneToMany(mappedBy = "category", cascade = CascadeType.REFRESH, fetch = FetchType.LAZY)
  private Set<Task> tasks = new HashSet<>();
}
