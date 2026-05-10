package com.hedi.todo.backend.config;

import java.time.LocalDate;
import java.util.List;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.hedi.todo.backend.entity.Task;
import com.hedi.todo.backend.entity.TaskPriority;
import com.hedi.todo.backend.entity.TaskStatus;
import com.hedi.todo.backend.repository.TaskRepository;

/**
 * Seeds initial demo data when the database is empty.
 */
@Configuration
public class DataSeeder {

	@Bean
	CommandLineRunner seedTasks(TaskRepository taskRepository) {
		return args -> {
			if (taskRepository.count() > 0) {
				return;
			}

			List<Task> sampleTasks = List.of(
				Task.builder()
					.title("Plan project roadmap")
					.description("Break the todo app into milestones for authentication, task management, and polish.")
					.priority(TaskPriority.HIGH)
					.deadline(LocalDate.of(2026, 5, 21))
					.category("Planning")
					.status(TaskStatus.TODO)
					.build(),
				Task.builder()
					.title("Set up initial component structure")
					.description("Created reusable components and a task model for the frontend.")
					.priority(TaskPriority.MEDIUM)
					.deadline(LocalDate.of(2026, 5, 8))
					.category("Setup")
					.status(TaskStatus.DONE)
					.build(),
				Task.builder()
					.title("Draft the task creation flow")
					.description("Design a minimal modal or panel for adding new tasks quickly.")
					.priority(TaskPriority.LOW)
					.deadline(LocalDate.of(2026, 5, 14))
					.category("UX")
					.status(TaskStatus.IN_PROGRESS)
					.build(),
				Task.builder()
					.title("Review state management approach")
					.description("Compare local state, context, or a lightweight store for the next step.")
					.priority(TaskPriority.MEDIUM)
					.deadline(LocalDate.of(2026, 5, 18))
					.category("Architecture")
					.status(TaskStatus.TODO)
					.build()
				);

			taskRepository.saveAll(sampleTasks);
		};
	}

}
