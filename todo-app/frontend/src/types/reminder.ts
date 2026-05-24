import type { Task } from './task';

export type ReminderStatus = 'PENDING' | 'SNOOZED' | 'DONE';

export interface Reminder {
  id: number;
  task: Task;
  reminderAt: string;
  note: string | null;
  status: ReminderStatus;
  snoozeUntil: string | null;
  createdAt: string;
  updatedAt: string;
}
