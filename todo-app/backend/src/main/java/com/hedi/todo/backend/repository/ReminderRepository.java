package com.hedi.todo.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.hedi.todo.backend.entity.Reminder;
import com.hedi.todo.backend.entity.ReminderStatus;

/**
 * Repository interface for Reminder entity.
 */
@Repository
public interface ReminderRepository extends JpaRepository<Reminder, Long> {
	List<Reminder> findAllByOrderByReminderAtAsc();

	List<Reminder> findByStatus(ReminderStatus status);
}