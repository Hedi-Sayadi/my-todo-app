import type { Task } from '../types/task'
import styles from './RecommendedTask.module.css'

interface RecommendedTaskProps {
  task: Task
  reason?: string
  onStart?: (task: Task) => void
}

const priorityColors: Record<'LOW' | 'MEDIUM' | 'HIGH', string> = {
  LOW: '#10b981',
  MEDIUM: '#b45309',
  HIGH: '#991b1b',
}

export default function RecommendedTask({ task, reason, onStart }: RecommendedTaskProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00')
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <article className={styles.card}>
      <div className={styles.cardContent}>
        <div className={styles.header}>
          <div>
            <p className={styles.label}>Recommended for you</p>
            <h3 className={styles.title}>{task.title}</h3>
          </div>
          <div
            className={styles.priorityBadge}
            style={{ backgroundColor: `${priorityColors[task.priority]}20` }}
          >
            <span style={{ color: priorityColors[task.priority] }}>{task.priority}</span>
          </div>
        </div>

        {reason && <p className={styles.reason}>{reason}</p>}

        <p className={styles.description}>{task.description}</p>

        <div className={styles.meta}>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Category</span>
            <span className={styles.metaValue}>{task.category}</span>
          </div>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Due</span>
            <span className={styles.metaValue}>{task.deadline ? formatDate(task.deadline) : 'No deadline'}</span>
          </div>
        </div>

        {onStart ? (
          <button className={styles.startButton} onClick={() => onStart(task)} type="button">
            Start Task
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
        ) : null}
      </div>

      <div className={styles.glow} />
    </article>
  )
}