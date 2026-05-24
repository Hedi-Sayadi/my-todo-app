package com.hedi.todo.backend.repository;

import com.hedi.todo.backend.entity.Category;
import com.hedi.todo.backend.entity.Task;
import com.hedi.todo.backend.entity.TaskStatus;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository interface for Task entity.
 *
 * <p>Extends JpaRepository to provide CRUD operations and custom query methods.
 */
@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {

  /**
   * Find all tasks with a specific status.
   *
   * @param status the task status to filter by
   * @return list of tasks with the specified status
   */
  List<Task> findByStatus(TaskStatus status);

  /**
   * Find all tasks with a specific category.
   *
   * @param category the category entity to filter by
   * @return list of tasks in the specified category
   */
  List<Task> findByCategory(Category category);

  /**
   * Find all tasks containing a keyword in title or description.
   *
   * @param keyword the search keyword
   * @return list of tasks matching the keyword
   */
  List<Task> findByTitleContainingIgnoreCaseOrDescriptionContainingIgnoreCase(
      String keyword, String keyword2);
}
