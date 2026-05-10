import type { Task } from '../types/task'
import styles from './TaskCard.module.css'

type TaskCardProps = {
	task: Task
	onEdit?: (task: Task) => void
	onDelete?: (id: number) => void
}

const priorityLabels: Record<Task['priority'], string> = {
	LOW: 'Low',
	MEDIUM: 'Medium',
	HIGH: 'High',
}

const statusLabels: Record<Task['status'], string> = {
	TODO: 'Todo',
	IN_PROGRESS: 'In progress',
	DONE: 'Done',
}

function formatDeadline(deadline: string | null) {
	if (!deadline) {
		return 'No deadline'
	}

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

function TaskCard({ task, onEdit, onDelete }: TaskCardProps) {
	const hasDescription = task.description.trim().length > 0
	const hasActions = Boolean(onEdit || onDelete)

	return (
		<article
			className={`${styles.card} ${task.status === 'DONE' ? styles.done : ''}`}
		>
			<div className={styles.headerRow}>
				<span className={`${styles.statusPill} ${styles[task.status.toLowerCase()]}`}>
					{statusLabels[task.status]}
				</span>

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
						<dd>{statusLabels[task.status]}</dd>
					</div>
				</dl>
			</div>

			{hasActions ? (
				<div className={styles.actions}>
					{onEdit ? (
						<button
							type="button"
							className={styles.secondaryButton}
							onClick={() => onEdit(task)}
						>
							Edit
						</button>
					) : null}
					{onDelete ? (
						<button
							type="button"
							className={styles.dangerButton}
							onClick={() => onDelete(task.id)}
						>
							Delete
						</button>
					) : null}
				</div>
			) : null}
		</article>
	)
}

export default TaskCard