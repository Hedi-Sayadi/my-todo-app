package com.hedi.todo.backend.integration;

import static org.assertj.core.api.Assertions.assertThat;

import com.hedi.todo.backend.entity.Category;
import com.hedi.todo.backend.entity.Task;
import com.hedi.todo.backend.entity.TaskPriority;
import com.hedi.todo.backend.entity.TaskStatus;
import com.hedi.todo.backend.repository.CategoryRepository;
import com.hedi.todo.backend.repository.TaskRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

@Testcontainers
@SpringBootTest
public class TaskRepositoryIntegrationTest {

  @Container
  public static PostgreSQLContainer<?> postgres =
      new PostgreSQLContainer<>("postgres:16")
          .withDatabaseName("testdb")
          .withUsername("test")
          .withPassword("test");

  @DynamicPropertySource
  static void registerPgProperties(DynamicPropertyRegistry registry) {
    registry.add("spring.datasource.url", postgres::getJdbcUrl);
    registry.add("spring.datasource.username", postgres::getUsername);
    registry.add("spring.datasource.password", postgres::getPassword);
    registry.add("spring.datasource.driver-class-name", postgres::getDriverClassName);
  }

  @Autowired private TaskRepository taskRepository;

  @Autowired private CategoryRepository categoryRepository;

  @Test
  void saveTaskAndFindById() {
    Category cat = new Category();
    cat.setName("IntegrationCategory");
    Category savedCat = categoryRepository.save(cat);

    Task task =
        Task.builder()
            .title("Integration Test Task")
            .description("created by Testcontainers")
            .priority(TaskPriority.MEDIUM)
            .status(TaskStatus.TODO)
            .category(savedCat)
            .build();

    Task saved = taskRepository.save(task);

    assertThat(saved.getId()).isNotNull();
    assertThat(taskRepository.findById(saved.getId())).isPresent();
    assertThat(taskRepository.findById(saved.getId()).get().getTitle())
        .isEqualTo("Integration Test Task");
    assertThat(taskRepository.findByStatus(TaskStatus.TODO).stream().map(Task::getTitle))
        .contains("Integration Test Task");
  }
}
