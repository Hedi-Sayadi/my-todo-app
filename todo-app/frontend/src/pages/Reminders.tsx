import Header from '../components/Header'
import Sidebar from '../components/Sidebar'
import styles from './PagePlaceholder.module.css'

const reminders = [
  {
    title: 'Review roadmap draft',
    due: 'Today, 4:00 PM',
    priority: 'HIGH',
    status: 'Overdue in 2h',
  },
  {
    title: 'Finish dashboard polish',
    due: 'Tomorrow, 9:00 AM',
    priority: 'MEDIUM',
    status: 'Due soon',
  },
  {
    title: 'Check backend integration',
    due: 'May 12, 10:00 AM',
    priority: 'LOW',
    status: 'Planned reminder',
  },
]

export default function Reminders() {
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
              <strong className={styles.statValue}>1</strong>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Overdue</span>
              <strong className={styles.statValue}>1</strong>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Upcoming</span>
              <strong className={styles.statValue}>2</strong>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Alerts enabled</span>
              <strong className={styles.statValue}>3</strong>
            </div>
          </div>

          <section className={styles.panel}>
            <p className={styles.sectionLabel}>Upcoming reminders</p>
            <div className={styles.list} style={{ marginTop: '16px' }}>
              {reminders.map((reminder) => (
                <div className={styles.reminderCard} key={reminder.title}>
                  <div className={styles.metricRow}>
                    <div>
                      <h4 className={styles.cardTitle}>{reminder.title}</h4>
                      <p className={styles.cardText}>Due {reminder.due}</p>
                    </div>
                    <span className={`${styles.chip} ${reminder.priority === 'HIGH' ? styles.priorityHigh : reminder.priority === 'MEDIUM' ? styles.priorityMedium : styles.priorityLow}`}>
                      {reminder.priority}
                    </span>
                  </div>
                  <div className={styles.actionRow}>
                    <span className={styles.status}>{reminder.status}</span>
                    <button className={styles.secondaryButton} type="button">Snooze</button>
                    <button className={styles.secondaryButton} type="button">Mark done</button>
                  </div>
                </div>
              ))}
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
