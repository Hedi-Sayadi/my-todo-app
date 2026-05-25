import { useEffect, useMemo, useState } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { listTasks } from '../services/taskService';
import {
  createReminder,
  deleteReminder,
  listReminders,
  markReminderDone,
  snoozeReminder,
  updateReminder,
  type ReminderPayload,
} from '../services/reminderService';
import type { Reminder, ReminderStatus } from '../types/reminder';
import type { Task } from '../types/task';
import styles from './PagePlaceholder.module.css';

type ReminderViewState = 'Overdue' | 'Due today' | 'Due soon';

const reminderStatusLabels: Record<ReminderStatus, string> = {
  PENDING: 'Pending',
  SNOOZED: 'Snoozed',
  DONE: 'Done',
};

const reminderStatusClasses: Record<ReminderStatus, string> = {
  PENDING: styles.priorityLow,
  SNOOZED: styles.priorityMedium,
  DONE: styles.activeBadge,
};

const reminderStateOrder: Record<ReminderViewState, number> = {
  Overdue: 0,
  'Due today': 1,
  'Due soon': 2,
};

const reminderSnoozeMinutes = 60;
const dayMs = 24 * 60 * 60 * 1000;

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function formatReminderDateTime(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));
}

function formatDateTimeLocal(value: string) {
  return value.slice(0, 16);
}

function formatNewReminderDateTime() {
  const value = new Date(Date.now() + 60 * 60 * 1000);
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  const hours = String(value.getHours()).padStart(2, '0');
  const minutes = String(value.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function getEffectiveReminderTime(reminder: Reminder) {
  return reminder.snoozeUntil ?? reminder.reminderAt;
}

function getReminderState(reminder: Reminder, now: Date): ReminderViewState {
  const effectiveTime = startOfDay(new Date(getEffectiveReminderTime(reminder)));
  const today = startOfDay(now);
  const diffDays = Math.floor((effectiveTime.getTime() - today.getTime()) / dayMs);

  if (diffDays < 0) return 'Overdue';
  if (diffDays === 0) return 'Due today';
  return 'Due soon';
}

function getCountLabel(count: number) {
  return count.toString().padStart(2, '0');
}

type ReminderFormState = {
  taskId: string;
  reminderAt: string;
  note: string;
  status: ReminderStatus;
};

const defaultFormState: ReminderFormState = {
  taskId: '',
  reminderAt: formatNewReminderDateTime(),
  note: '',
  status: 'PENDING',
};

type NotificationPreferences = {
  browserNotifications: boolean;
  emailSummaries: boolean;
};

const defaultNotificationPrefs: NotificationPreferences = {
  browserNotifications: false,
  emailSummaries: false,
};

const NOTIFICATION_PREFS_KEY = 'reminder-notification-prefs';

function loadNotificationPreferences(): NotificationPreferences {
  if (typeof window === 'undefined') return defaultNotificationPrefs;

  try {
    const rawValue = window.localStorage.getItem(NOTIFICATION_PREFS_KEY);
    if (!rawValue) return defaultNotificationPrefs;

    return {
      ...defaultNotificationPrefs,
      ...(JSON.parse(rawValue) as Partial<NotificationPreferences>),
    };
  } catch {
    return defaultNotificationPrefs;
  }
}

async function requestNotificationPermission() {
  if (!('Notification' in window)) return false;

  if (Notification.permission === 'granted') return true;

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
}

export default function Reminders() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [formState, setFormState] = useState<ReminderFormState>(defaultFormState);
  const [notificationPrefs, setNotificationPrefs] = useState<NotificationPreferences>(() =>
    loadNotificationPreferences()
  );

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        setIsLoading(true);
        setError('');
        const [taskData, reminderData] = await Promise.all([listTasks(), listReminders()]);

        if (isMounted) {
          setTasks(taskData);
          setReminders(reminderData);
        }
      } catch (loadError) {
        if (isMounted) {
          setError(loadError instanceof Error ? loadError.message : 'Failed to load reminders');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(NOTIFICATION_PREFS_KEY, JSON.stringify(notificationPrefs));
  }, [notificationPrefs]);

  const updateNotificationPrefs = async <K extends keyof NotificationPreferences>(
    key: K,
    value: NotificationPreferences[K]
  ) => {
    if (key === 'browserNotifications' && value === true) {
      const permitted = await requestNotificationPermission();
      if (!permitted) {
        setError(
          'Browser notifications permission denied. Please enable it in your browser settings.'
        );
        return;
      }
    }

    setNotificationPrefs((current) => ({ ...current, [key]: value }));
  };

  const activeReminders = useMemo(
    () => reminders.filter((reminder) => reminder.status !== 'DONE'),
    [reminders]
  );
  const completedCount = reminders.length - activeReminders.length;
  const reminderTaskIds = useMemo(
    () => new Set(reminders.map((reminder) => reminder.task.id)),
    [reminders]
  );
  const availableTasks = useMemo(
    () =>
      tasks.filter((task) => {
        if (editingReminder?.task.id === task.id) return true;
        return !reminderTaskIds.has(task.id);
      }),
    [tasks, reminderTaskIds, editingReminder]
  );

  const reminderCards = useMemo(
    () =>
      activeReminders
        .map((reminder) => ({
          reminder,
          state: getReminderState(reminder, new Date()),
        }))
        .sort((left, right) => {
          const leftState = reminderStateOrder[left.state];
          const rightState = reminderStateOrder[right.state];

          if (leftState !== rightState) return leftState - rightState;

          return (
            new Date(getEffectiveReminderTime(left.reminder)).getTime() -
            new Date(getEffectiveReminderTime(right.reminder)).getTime()
          );
        }),
    [activeReminders]
  );

  const dueTodayCount = reminderCards.filter((item) => item.state === 'Due today').length;
  const overdueCount = reminderCards.filter((item) => item.state === 'Overdue').length;
  const upcomingCount = reminderCards.filter((item) => item.state === 'Due soon').length;

  const resetForm = () => {
    setFormState(defaultFormState);
    setEditingReminder(null);
    setIsFormOpen(false);
  };

  const startCreate = () => {
    if (availableTasks.length === 0) {
      setError(
        'All tasks already have reminders. Update an existing reminder or create a new task to add another.'
      );
      return;
    }
    setEditingReminder(null);
    setFormState({
      taskId: availableTasks[0] ? String(availableTasks[0].id) : '',
      reminderAt: formatNewReminderDateTime(),
      note: '',
      status: 'PENDING',
    });
    setIsFormOpen(true);
  };

  const startEdit = (reminder: Reminder) => {
    setEditingReminder(reminder);
    setFormState({
      taskId: String(reminder.task.id),
      reminderAt: formatDateTimeLocal(reminder.reminderAt),
      note: reminder.note ?? '',
      status: reminder.status,
    });
    setIsFormOpen(true);
  };

  const handleSave = () => {
    const saveReminder = async () => {
      try {
        setError('');

        const payload: ReminderPayload = {
          taskId: Number(formState.taskId),
          reminderAt: formState.reminderAt,
          note: formState.note,
          status: formState.status,
        };

        if (editingReminder) {
          const updated = await updateReminder(editingReminder.id, payload);
          setReminders((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
        } else {
          const created = await createReminder(payload);
          setReminders((prev) => [created, ...prev]);

          if (notificationPrefs.browserNotifications && 'Notification' in window) {
            const task = tasks.find((t) => t.id === Number(formState.taskId));
            new Notification('Reminder created', {
              body: `Reminder set for "${task?.title || 'task'}" at ${formatReminderDateTime(
                created.reminderAt
              )}.`,
              icon: '/favicon.ico',
            });
          }
        }

        resetForm();
      } catch (saveError) {
        setError(saveError instanceof Error ? saveError.message : 'Failed to save reminder');
      }
    };

    void saveReminder();
  };

  const handleDelete = (reminder: Reminder) => {
    const deleteCurrent = async () => {
      try {
        setError('');
        await deleteReminder(reminder.id);
        setReminders((prev) => prev.filter((item) => item.id !== reminder.id));

        if (editingReminder?.id === reminder.id) {
          resetForm();
        }
      } catch (deleteError) {
        setError(deleteError instanceof Error ? deleteError.message : 'Failed to delete reminder');
      }
    };

    if (window.confirm(`Delete reminder for "${reminder.task.title}"?`)) {
      void deleteCurrent();
    }
  };

  const handleSnooze = (reminder: Reminder) => {
    const snoozeCurrent = async () => {
      try {
        setError('');
        const updated = await snoozeReminder(reminder.id, { minutes: reminderSnoozeMinutes });
        setReminders((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
      } catch (snoozeError) {
        setError(snoozeError instanceof Error ? snoozeError.message : 'Failed to snooze reminder');
      }
    };

    void snoozeCurrent();
  };

  const handleDone = (reminder: Reminder) => {
    const completeReminder = async () => {
      try {
        setError('');
        const updated = await markReminderDone(reminder.id);
        setReminders((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));

        if (notificationPrefs.browserNotifications && 'Notification' in window) {
          new Notification('Reminder completed', {
            body: `Great! You completed the reminder for "${reminder.task.title}".`,
            icon: '/favicon.ico',
          });
        }
      } catch (completeError) {
        setError(
          completeError instanceof Error ? completeError.message : 'Failed to mark reminder done'
        );
      }
    };

    void completeReminder();
  };

  return (
    <div className={styles.shell}>
      <Sidebar activeItem="Reminders" onItemSelect={() => {}} />
      <main className={styles.main}>
        <Header pageTitle="Reminders" />
        <div className={styles.content}>
          <div className={styles.topBar}>
            <div>
              <p className={styles.eyebrow}>Attention</p>
              <h2 className={styles.title}>Reminders</h2>
              <p className={styles.subtitle}>
                Keep track of task-linked reminders, snooze them when needed, and mark them done
                when the work is complete.
              </p>
            </div>
            <button className={styles.createButton} type="button" onClick={startCreate}>
              + Add Reminder
            </button>
          </div>

          {error ? (
            <div className={styles.emptyState}>
              <p className={styles.emptyText}>{error}</p>
            </div>
          ) : null}

          {isFormOpen ? (
            <section className={styles.panel}>
              <p className={styles.sectionLabel}>
                {editingReminder ? 'Edit reminder' : 'Create reminder'}
              </p>
              <div className={styles.formGrid}>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel} htmlFor="reminder-task">
                    Task
                  </label>
                  <select
                    id="reminder-task"
                    className={styles.fieldInput}
                    value={formState.taskId}
                    onChange={(e) => setFormState((prev) => ({ ...prev, taskId: e.target.value }))}
                    disabled={availableTasks.length === 0}
                  >
                    {availableTasks.length === 0 ? (
                      <option value="">No tasks available for reminders</option>
                    ) : (
                      availableTasks.map((task) => (
                        <option key={task.id} value={task.id}>
                          {task.title} · {task.category.name}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel} htmlFor="reminder-at">
                    Reminder time
                  </label>
                  <input
                    id="reminder-at"
                    type="datetime-local"
                    className={styles.fieldInput}
                    value={formState.reminderAt}
                    onChange={(e) =>
                      setFormState((prev) => ({ ...prev, reminderAt: e.target.value }))
                    }
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel} htmlFor="reminder-note">
                    Note
                  </label>
                  <textarea
                    id="reminder-note"
                    className={styles.fieldTextarea}
                    value={formState.note}
                    onChange={(e) => setFormState((prev) => ({ ...prev, note: e.target.value }))}
                    placeholder="Optional note for this reminder"
                    rows={3}
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel} htmlFor="reminder-status">
                    Status
                  </label>
                  <select
                    id="reminder-status"
                    className={styles.fieldInput}
                    value={formState.status}
                    onChange={(e) =>
                      setFormState((prev) => ({
                        ...prev,
                        status: e.target.value as ReminderStatus,
                      }))
                    }
                  >
                    <option value="PENDING">Pending</option>
                    <option value="DONE">Done</option>
                  </select>
                </div>
              </div>
              <div className={styles.buttonGroup} style={{ marginTop: '16px' }}>
                <button
                  className={styles.createButton}
                  type="button"
                  onClick={handleSave}
                  disabled={!formState.taskId || !formState.reminderAt}
                >
                  {editingReminder ? 'Update Reminder' : 'Create Reminder'}
                </button>
                <button className={styles.secondaryButton} type="button" onClick={resetForm}>
                  Cancel
                </button>
              </div>
            </section>
          ) : null}

          <div className={styles.stats}>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Due today</span>
              <strong className={styles.statValue}>{getCountLabel(dueTodayCount)}</strong>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Overdue</span>
              <strong className={styles.statValue}>{getCountLabel(overdueCount)}</strong>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Upcoming</span>
              <strong className={styles.statValue}>{getCountLabel(upcomingCount)}</strong>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Completed</span>
              <strong className={styles.statValue}>{getCountLabel(completedCount)}</strong>
            </div>
          </div>

          <section className={styles.panel}>
            <p className={styles.sectionLabel}>Upcoming reminders</p>
            <div className={styles.list} style={{ marginTop: '16px' }}>
              {isLoading ? (
                <div className={styles.emptyState}>
                  <p className={styles.emptyText}>Loading reminders from the backend...</p>
                </div>
              ) : reminderCards.length > 0 ? (
                reminderCards.map(({ reminder, state }) => (
                  <div className={styles.reminderCard} key={reminder.id}>
                    <div className={styles.metricRow}>
                      <div>
                        <div className={styles.tagRow}>
                          <h4 className={styles.cardTitle}>{reminder.task.title}</h4>
                          <span className={styles.chip}>{reminder.task.category.name}</span>
                        </div>
                        <p className={styles.cardText}>
                          {reminder.note ? reminder.note : 'No note added yet.'}
                        </p>
                      </div>
                      <span className={`${styles.chip} ${reminderStatusClasses[reminder.status]}`}>
                        {reminderStatusLabels[reminder.status]}
                      </span>
                    </div>
                    <div className={styles.metaRow}>
                      <span className={styles.status}>{state}</span>
                      <span className={styles.cardText}>
                        For {formatReminderDateTime(getEffectiveReminderTime(reminder))}
                      </span>
                      <span
                        className={`${styles.chip} ${
                          reminder.task.priority === 'HIGH'
                            ? styles.priorityHigh
                            : reminder.task.priority === 'MEDIUM'
                              ? styles.priorityMedium
                              : styles.priorityLow
                        }`}
                      >
                        {reminder.task.priority}
                      </span>
                    </div>
                    <div className={styles.actionRow}>
                      <button
                        className={styles.secondaryButton}
                        type="button"
                        onClick={() => handleSnooze(reminder)}
                      >
                        Snooze 1h
                      </button>
                      <button
                        className={styles.secondaryButton}
                        type="button"
                        onClick={() => handleDone(reminder)}
                      >
                        Mark done
                      </button>
                      <button
                        className={styles.secondaryButton}
                        type="button"
                        onClick={() => startEdit(reminder)}
                      >
                        Edit
                      </button>
                      <button
                        className={styles.secondaryButton}
                        type="button"
                        onClick={() => handleDelete(reminder)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              ) : tasks.length > 0 ? (
                <div className={styles.emptyState}>
                  <p className={styles.emptyText}>
                    No active reminders yet. Create one from a task deadline or schedule a custom
                    reminder.
                  </p>
                </div>
              ) : (
                <div className={styles.emptyState}>
                  <p className={styles.emptyText}>
                    No tasks available. Create tasks first so reminders have something to attach to.
                  </p>
                </div>
              )}
            </div>
          </section>

          <section className={styles.settingsGrid}>
            <div className={styles.preferenceCard}>
              <p className={styles.sectionLabel}>Notifications</p>
              <h3 className={styles.sectionTitle}>How alerts should reach you</h3>
              <div className={styles.settingRow}>
                <div>
                  <div className={styles.itemName}>Browser notifications</div>
                  <div className={styles.itemMeta}>Show reminders while the app is open.</div>
                </div>
                <button
                  type="button"
                  aria-pressed={notificationPrefs.browserNotifications}
                  className={
                    notificationPrefs.browserNotifications
                      ? styles.toggle
                      : `${styles.toggle} ${styles.toggleOff}`
                  }
                  onClick={() =>
                    updateNotificationPrefs(
                      'browserNotifications',
                      !notificationPrefs.browserNotifications
                    )
                  }
                />
              </div>
              <div className={styles.settingRow}>
                <div>
                  <div className={styles.itemName}>Email summaries</div>
                  <div className={styles.itemMeta}>Send a daily overview of overdue reminders.</div>
                </div>
                <button
                  type="button"
                  aria-pressed={notificationPrefs.emailSummaries}
                  className={
                    notificationPrefs.emailSummaries
                      ? styles.toggle
                      : `${styles.toggle} ${styles.toggleOff}`
                  }
                  onClick={() =>
                    updateNotificationPrefs('emailSummaries', !notificationPrefs.emailSummaries)
                  }
                />
              </div>
            </div>

            <div className={styles.preferenceCard}>
              <p className={styles.sectionLabel}>Reminder timing</p>
              <h3 className={styles.sectionTitle}>When to notify</h3>
              <p className={styles.cardText}>
                Use task-linked reminders to schedule a heads-up before the deadline, then snooze
                them when you need more time.
              </p>
              <div className={styles.buttonGroup}>
                <button className={styles.secondaryButton} type="button">
                  24h before
                </button>
                <button className={styles.secondaryButton} type="button">
                  2h before
                </button>
                <button className={styles.secondaryButton} type="button">
                  On due date
                </button>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
