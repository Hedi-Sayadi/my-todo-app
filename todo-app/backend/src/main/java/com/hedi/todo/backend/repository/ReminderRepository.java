package com.hedi.todo.backend.repository;

import com.hedi.todo.backend.entity.Reminder;
import com.hedi.todo.backend.entity.ReminderStatus;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/** Repository interface for Reminder entity. */
@Repository
public interface ReminderRepository extends JpaRepository<Reminder, Long> {
  List<Reminder> findAllByOrderByReminderAtAsc();

  List<Reminder> findByStatus(ReminderStatus status);

  boolean existsByTaskId(Long taskId);

  boolean existsByTaskIdAndIdNot(Long taskId, Long id);

  java.util.Optional<Reminder> findByTaskId(Long taskId);
}
