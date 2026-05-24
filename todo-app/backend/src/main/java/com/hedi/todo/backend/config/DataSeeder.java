package com.hedi.todo.backend.config;

import com.hedi.todo.backend.entity.Category;
import com.hedi.todo.backend.entity.Reminder;
import com.hedi.todo.backend.entity.ReminderStatus;
import com.hedi.todo.backend.entity.Task;
import com.hedi.todo.backend.entity.TaskPriority;
import com.hedi.todo.backend.entity.TaskStatus;
import com.hedi.todo.backend.repository.CategoryRepository;
import com.hedi.todo.backend.repository.ReminderRepository;
import com.hedi.todo.backend.repository.TaskRepository;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/** Seeds initial demo data when the database is empty. */
@Configuration
public class DataSeeder {

  @Bean
  CommandLineRunner seedData(
      TaskRepository taskRepository,
      CategoryRepository categoryRepository,
      ReminderRepository reminderRepository) {
    return args -> {
      // Check if data already exists
      if (taskRepository.count() > 0) {
        return;
      }

      // Create categories
      List<Category> categories =
          List.of(
              Category.builder()
                  .name("Planning")
                  .description("Project planning and roadmap tasks")
                  .build(),
              Category.builder()
                  .name("Setup")
                  .description("Initial setup and configuration")
                  .build(),
              Category.builder()
                  .name("UX")
                  .description("User experience and interface design")
                  .build(),
              Category.builder()
                  .name("Architecture")
                  .description("System design and architecture decisions")
                  .build());
      List<Category> savedCategories = categoryRepository.saveAll(categories);

      // Create tasks with category references
      List<Task> sampleTasks =
          List.of(
              Task.builder()
                  .title("Plan project roadmap")
                  .description(
                      "Break the todo app into milestones for authentication, task management, and polish.")
                  .priority(TaskPriority.HIGH)
                  .deadline(LocalDate.of(2026, 5, 21))
                  .category(savedCategories.get(0))
                  .status(TaskStatus.TODO)
                  .build(),
              Task.builder()
                  .title("Set up initial component structure")
                  .description("Created reusable components and a task model for the frontend.")
                  .priority(TaskPriority.MEDIUM)
                  .deadline(LocalDate.of(2026, 5, 8))
                  .category(savedCategories.get(1))
                  .status(TaskStatus.DONE)
                  .build(),
              Task.builder()
                  .title("Draft the task creation flow")
                  .description("Design a minimal modal or panel for adding new tasks quickly.")
                  .priority(TaskPriority.LOW)
                  .deadline(LocalDate.of(2026, 5, 14))
                  .category(savedCategories.get(2))
                  .status(TaskStatus.IN_PROGRESS)
                  .build(),
              Task.builder()
                  .title("Review state management approach")
                  .description(
                      "Compare local state, context, or a lightweight store for the next step.")
                  .priority(TaskPriority.MEDIUM)
                  .deadline(LocalDate.of(2026, 5, 18))
                  .category(savedCategories.get(3))
                  .status(TaskStatus.TODO)
                  .build());

      List<Task> savedTasks = taskRepository.saveAll(sampleTasks);

      List<Reminder> sampleReminders =
          List.of(
              Reminder.builder()
                  .task(savedTasks.get(0))
                  .reminderAt(LocalDateTime.of(2026, 5, 20, 16, 0))
                  .note("Review the roadmap before sprint planning.")
                  .status(ReminderStatus.PENDING)
                  .build(),
              Reminder.builder()
                  .task(savedTasks.get(1))
                  .reminderAt(LocalDateTime.of(2026, 5, 11, 18, 0))
                  .note("Confirm the completed setup tasks.")
                  .status(ReminderStatus.SNOOZED)
                  .snoozeUntil(LocalDateTime.of(2026, 5, 11, 17, 30))
                  .build(),
              Reminder.builder()
                  .task(savedTasks.get(2))
                  .reminderAt(LocalDateTime.of(2026, 5, 12, 10, 0))
                  .note("Prepare the UX draft for review.")
                  .status(ReminderStatus.PENDING)
                  .build(),
              Reminder.builder()
                  .task(savedTasks.get(3))
                  .reminderAt(LocalDateTime.of(2026, 5, 18, 11, 0))
                  .note("Check the architecture notes.")
                  .status(ReminderStatus.PENDING)
                  .build());

      reminderRepository.saveAll(sampleReminders);
    };
  }
}
