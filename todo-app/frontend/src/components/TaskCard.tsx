import type { Task } from '../types/task'
import styles from './TaskCard.module.css'

type TaskCardProps = {
	task: Task
	onToggleComplete: (id: number) => void
	onEdit: (task: Task) => void
	onDelete: (id: number) => void
}

const priorityLabels: Record<Task['priority'], string> = {
	LOW: 'Low',
	MEDIUM: 'Medium',
	HIGH: 'High',
}

function formatDeadline(deadline: string) {
	const parsedDate = new Date(deadline)

	if (Number.isNaN(parsedDate.getTime())) {
		return deadline
	}

	return new Intl.DateTimeFormat('en', {
		day: '2-digit',
		month: 'short',
		year: 'numeric',
	}).format(parsedDate)
}

function TaskCard({ task, onToggleComplete, onEdit, onDelete }: TaskCardProps) {
	const hasDescription = task.description.trim().length > 0

	return (
		<article
			className={`${styles.card} ${task.completed ? styles.completed : ''}`}
		>
			<div className={styles.headerRow}>
				<label className={styles.checkboxLabel}>
					<input
						className={styles.checkbox}
						type="checkbox"
						checked={task.completed}
						onChange={() => onToggleComplete(task.id)}
					/>
					<span className={styles.checkboxMark} aria-hidden="true" />
				</label>

				<span
					className={`${styles.priorityBadge} ${styles[task.priority.toLowerCase()]}`}
				>
					{priorityLabels[task.priority]}
				</span>
			</div>

			<div className={styles.content}>
				<div className={styles.titleRow}>
					<h3 className={styles.title}>{task.title}</h3>
					<span className={styles.category}>{task.category}</span>
				</div>

				{hasDescription ? (
					<p className={styles.description}>{task.description}</p>
				) : null}

				<dl className={styles.metaList}>
					<div className={styles.metaItem}>
						<dt>Deadline</dt>
						<dd>{formatDeadline(task.deadline)}</dd>
					</div>
					<div className={styles.metaItem}>
						<dt>Status</dt>
						<dd>{task.completed ? 'Completed' : 'In progress'}</dd>
					</div>
				</dl>
			</div>

			<div className={styles.actions}>
				<button
					type="button"
					className={styles.secondaryButton}
					onClick={() => onEdit(task)}
				>
					Edit
				</button>
				<button
					type="button"
					className={styles.dangerButton}
					onClick={() => onDelete(task.id)}
				>
					Delete
				</button>
			</div>
		</article>
	)
}

export default TaskCard