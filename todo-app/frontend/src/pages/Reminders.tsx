import { useEffect, useMemo, useState } from 'react'
import Header from '../components/Header'
import Sidebar from '../components/Sidebar'
import { listTasks } from '../services/taskService'
import type { Task } from '../types/task'
import styles from './PagePlaceholder.module.css'

type ReminderState = 'Overdue' | 'Due today' | 'Due soon'

type ReminderItem = {
  title: string
  dueLabel: string
  priority: Task['priority']
  state: ReminderState
  task: Task
}

const dayMs = 24 * 60 * 60 * 1000

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function formatDueLabel(deadline: string) {
  const dueDate = new Date(deadline)

  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(dueDate)
}

function getReminderState(deadline: string, now: Date): ReminderState {
  const dueDate = startOfDay(new Date(deadline))
  const today = startOfDay(now)
  const diffDays = Math.floor((dueDate.getTime() - today.getTime()) / dayMs)

  if (diffDays < 0) return 'Overdue'
  if (diffDays === 0) return 'Due today'
  return 'Due soon'
}

function getReminderCountLabel(count: number) {
  return count.toString().padStart(2, '0')
}

export default function Reminders() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true

    const loadTasks = async () => {
      try {
        setIsLoading(true)
        setError('')
        const taskData = await listTasks()

        if (isMounted) {
          setTasks(taskData)
        }
      } catch (loadError) {
        if (isMounted) {
          setError(loadError instanceof Error ? loadError.message : 'Failed to load reminders')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadTasks()

    return () => {
      isMounted = false
    }
  }, [])

  const reminders = useMemo<ReminderItem[]>(() => {
    const now = new Date()

    return tasks
      .filter((task) => task.deadline && task.status !== 'DONE')
      .map((task) => {
        const deadline = task.deadline as string

        return {
          title: task.title,
          dueLabel: formatDueLabel(deadline),
          priority: task.priority,
          state: getReminderState(deadline, now),
          task,
        }
      })
      .sort((left, right) => {
        const priorityOrder: Record<ReminderState, number> = {
          Overdue: 0,
          'Due today': 1,
          'Due soon': 2,
        }

        const leftState = priorityOrder[left.state]
        const rightState = priorityOrder[right.state]

        if (leftState !== rightState) return leftState - rightState

        return new Date(left.task.deadline as string).getTime() - new Date(right.task.deadline as string).getTime()
      })
  }, [tasks])

  const dueTodayCount = reminders.filter((reminder) => reminder.state === 'Due today').length
  const overdueCount = reminders.filter((reminder) => reminder.state === 'Overdue').length
  const upcomingCount = reminders.filter((reminder) => reminder.state === 'Due soon').length
  const enabledAlertsCount = reminders.length

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
                Keep track of overdue work, due-soon tasks, and how the app should notify you when something needs attention.
              </p>
            </div>
            <button className={styles.createButton} type="button">+ Add Reminder</button>
          </div>

          <div className={styles.stats}>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Due today</span>
              <strong className={styles.statValue}>{getReminderCountLabel(dueTodayCount)}</strong>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Overdue</span>
              <strong className={styles.statValue}>{getReminderCountLabel(overdueCount)}</strong>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Upcoming</span>
              <strong className={styles.statValue}>{getReminderCountLabel(upcomingCount)}</strong>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Alerts enabled</span>
              <strong className={styles.statValue}>{getReminderCountLabel(enabledAlertsCount)}</strong>
            </div>
          </div>

          <section className={styles.panel}>
            <p className={styles.sectionLabel}>Upcoming reminders</p>
            <div className={styles.list} style={{ marginTop: '16px' }}>
              {isLoading ? (
                <div className={styles.emptyState}>
                  <p className={styles.emptyText}>Loading reminders from task deadlines...</p>
                </div>
              ) : error ? (
                <div className={styles.emptyState}>
                  <p className={styles.emptyText}>{error}</p>
                </div>
              ) : reminders.length > 0 ? (
                reminders.map((reminder) => (
                  <div className={styles.reminderCard} key={reminder.task.id}>
                    <div className={styles.metricRow}>
                      <div>
                        <h4 className={styles.cardTitle}>{reminder.title}</h4>
                        <p className={styles.cardText}>Due {reminder.dueLabel}</p>
                      </div>
                      <span className={`${styles.chip} ${reminder.priority === 'HIGH' ? styles.priorityHigh : reminder.priority === 'MEDIUM' ? styles.priorityMedium : styles.priorityLow}`}>
                        {reminder.priority}
                      </span>
                    </div>
                    <div className={styles.actionRow}>
                      <span className={styles.status}>{reminder.state}</span>
                      <button className={styles.secondaryButton} type="button">Snooze</button>
                      <button className={styles.secondaryButton} type="button">Mark done</button>
                    </div>
                  </div>
                ))
              ) : (
                <div className={styles.emptyState}>
                  <p className={styles.emptyText}>No active task deadlines yet. Add a deadline to a task to see reminders here.</p>
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
                <div className={styles.toggle} />
              </div>
              <div className={styles.settingRow}>
                <div>
                  <div className={styles.itemName}>Email summaries</div>
                  <div className={styles.itemMeta}>Send a daily overview of overdue tasks.</div>
                </div>
                <div className={`${styles.toggle} ${styles.toggleOff}`} />
              </div>
            </div>

            <div className={styles.preferenceCard}>
              <p className={styles.sectionLabel}>Reminder timing</p>
              <h3 className={styles.sectionTitle}>When to notify</h3>
              <p className={styles.cardText}>
                Start with a reminder 24 hours before the deadline, then follow up again 2 hours before the task is due.
              </p>
              <div className={styles.buttonGroup}>
                <button className={styles.secondaryButton} type="button">24h before</button>
                <button className={styles.secondaryButton} type="button">2h before</button>
                <button className={styles.secondaryButton} type="button">On due date</button>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
