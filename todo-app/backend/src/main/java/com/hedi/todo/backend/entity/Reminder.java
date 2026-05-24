package com.hedi.todo.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Builder.Default;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

/** Reminder entity representing a scheduled reminder for a task. */
@Entity
@Table(
    name = "reminders",
    uniqueConstraints = {@jakarta.persistence.UniqueConstraint(columnNames = "task_id")})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Reminder {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @NotNull(message = "Reminder task is required")
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "task_id", nullable = false)
  private Task task;

  @NotNull(message = "Reminder time is required")
  @Column(name = "reminder_at", nullable = false)
  private LocalDateTime reminderAt;

  @Column(columnDefinition = "TEXT")
  private String note;

  @Default
  @NotNull(message = "Reminder status is required")
  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private ReminderStatus status = ReminderStatus.PENDING;

  @Column(name = "snooze_until")
  private LocalDateTime snoozeUntil;

  @CreationTimestamp
  @Column(nullable = false, updatable = false)
  private LocalDateTime createdAt;

  @UpdateTimestamp
  @Column(nullable = false)
  private LocalDateTime updatedAt;
}
