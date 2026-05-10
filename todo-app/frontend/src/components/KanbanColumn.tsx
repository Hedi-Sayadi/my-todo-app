import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import type { Task } from '../types/task'
import KanbanTaskCard from './KanbanTaskCard'
import styles from './KanbanColumn.module.css'

interface KanbanColumnProps {
	status: Task['status']
	title: string
	tasks: Task[]
	onEditTask: (task: Task) => void
	onDeleteTask: (id: number) => void
}

export default function KanbanColumn({
	status,
	title,
	tasks,
	onEditTask,
	onDeleteTask,
}: KanbanColumnProps) {
	const { setNodeRef } = useDroppable({
		id: `${status}-drop`,
	})

	return (
		<div className={styles.column}>
			<div className={styles.columnHeader}>
				<h3 className={styles.columnTitle}>{title}</h3>
				<span className={styles.taskCount}>{tasks.length}</span>
			</div>
			<SortableContext items={tasks.map((t) => `${status}-${t.id}`)} strategy={verticalListSortingStrategy}>
				<div className={styles.columnContent} ref={setNodeRef}>
					{tasks.length > 0 ? (
						tasks.map((task) => (
							<KanbanTaskCard
								key={task.id}
								task={task}
								status={status}
								onEdit={() => onEditTask(task)}
								onDelete={() => onDeleteTask(task.id)}
							/>
						))
					) : (
						<div className={styles.emptyColumn}>
							<p className={styles.emptyText}>No tasks yet</p>
						</div>
					)}
				</div>
			</SortableContext>
		</div>
	)
}
