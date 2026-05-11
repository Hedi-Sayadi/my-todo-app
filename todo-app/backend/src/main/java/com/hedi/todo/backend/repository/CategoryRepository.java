package com.hedi.todo.backend.repository;

import com.hedi.todo.backend.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository interface for Category entity.
 * 
 * Extends JpaRepository to provide CRUD operations and custom query methods.
 */
@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    /**
     * Find a category by its name.
     *
     * @param name the category name to search for
     * @return an Optional containing the category if found
     */
    Optional<Category> findByName(String name);

    /**
     * Check if a category with the given name exists.
     *
     * @param name the category name to check
     * @return true if a category with this name exists, false otherwise
     */
    boolean existsByName(String name);
}
