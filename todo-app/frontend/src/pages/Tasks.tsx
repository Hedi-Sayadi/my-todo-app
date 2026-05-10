import { useState } from 'react'
import {
	DndContext,
	closestCorners,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
	type DragEndEvent,
} from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import type { Task } from '../types/task'
import TaskModal from '../components/TaskModal'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import KanbanColumn from '../components/KanbanColumn'
import styles from './TasksPage.module.css'

const initialTasks: Task[] = [
	{
		id: 1,
		title: 'Plan project roadmap',
		description:
			'Break the todo app into milestones for authentication, task management, and polish.',
		priority: 'HIGH',
		deadline: '2026-05-21',
		category: 'Planning',
		status: 'TODO',
	},
	{
		id: 2,
		title: 'Set up initial component structure',
		description: 'Created reusable components and a task model for the frontend.',
		priority: 'MEDIUM',
		deadline: '2026-05-08',
		category: 'Setup',
		status: 'DONE',
	},
	{
		id: 3,
		title: 'Draft the task creation flow',
		description: 'Design a minimal modal or panel for adding new tasks quickly.',
		priority: 'LOW',
		deadline: '2026-05-14',
		category: 'UX',
		status: 'IN_PROGRESS',
	},
	{
		id: 4,
		title: 'Review state management approach',
		description: 'Compare local state, context, or a lightweight store for the next step.',
		priority: 'MEDIUM',
		deadline: '2026-05-18',
		category: 'Architecture',
		status: 'TODO',
	},
]

export default function Tasks() {
	const [tasks, setTasks] = useState(initialTasks)
	const [isModalOpen, setIsModalOpen] = useState(false)
	const [editingTask, setEditingTask] = useState<Task | null>(null)
	const [query, setQuery] = useState('')

	const sensors = useSensors(
		useSensor(PointerSensor),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		})
	)

	const filteredTasks = tasks.filter((task) => {
		const searchableText = [task.title, task.description, task.category, task.priority]
			.join(' ')
			.toLowerCase()
		return searchableText.includes(query.toLowerCase())
	})

	const todoTasks = filteredTasks.filter((t) => t.status === 'TODO')
	const inProgressTasks = filteredTasks.filter((t) => t.status === 'IN_PROGRESS')
	const doneTasks = filteredTasks.filter((t) => t.status === 'DONE')

	const handleOpenModal = () => {
		setEditingTask(null)
		setIsModalOpen(true)
	}

	const handleEditTask = (task: Task) => {
		setEditingTask(task)
		setIsModalOpen(true)
	}

	const handleCloseModal = () => {
		setIsModalOpen(false)
		setEditingTask(null)
	}

	const handleSaveTask = (taskData: Omit<Task, 'id'>) => {
		if (editingTask) {
			setTasks((prev) =>
				prev.map((t) => (t.id === editingTask.id ? { ...t, ...taskData } : t))
			)
		} else {
			const newTask: Task = {
				...taskData,
				id: Math.max(...tasks.map((t) => t.id), 0) + 1,
			}
			setTasks((prev) => [newTask, ...prev])
		}
		handleCloseModal()
	}

	const handleDeleteTask = (id: number) => {
		setTasks((prev) => prev.filter((t) => t.id !== id))
	}

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event

		if (!over) return

		const [activeStatus, activeId] = active.id.toString().split('-')
		const [overStatus] = over.id.toString().split('-')

		if (activeStatus !== overStatus) {
			setTasks((prev) =>
				prev.map((t) =>
					t.id === parseInt(activeId) ? { ...t, status: overStatus as Task['status'] } : t
				)
			)
		}
	}

	return (
		<div className={styles.shell}>
			<Sidebar onItemSelect={() => {}} />
			<main className={styles.main}>
				<Header pageTitle="Tasks" searchValue={query} onSearchChange={setQuery} />

				<div className={styles.container}>
					<div className={styles.topBar}>
						<div>
							<p className={styles.eyebrow}>Task Management</p>
							<h2 className={styles.title}>Kanban Board</h2>
						</div>
						<button className={styles.createButton} onClick={handleOpenModal} type="button">
							<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
								<line x1="12" y1="5" x2="12" y2="19" />
								<line x1="5" y1="12" x2="19" y2="12" />
							</svg>
							Add Task
						</button>
					</div>

					<div className={styles.stats}>
						<div className={styles.statCard}>
							<span className={styles.statLabel}>Total</span>
							<strong className={styles.statValue}>{tasks.length}</strong>
						</div>
						<div className={styles.statCard}>
							<span className={styles.statLabel}>Todo</span>
							<strong className={styles.statValue}>{todoTasks.length}</strong>
						</div>
						<div className={styles.statCard}>
							<span className={styles.statLabel}>In progress</span>
							<strong className={styles.statValue}>{inProgressTasks.length}</strong>
						</div>
						<div className={styles.statCard}>
							<span className={styles.statLabel}>Done</span>
							<strong className={styles.statValue}>{doneTasks.length}</strong>
						</div>
					</div>

					<DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
						<div className={styles.kanbanBoard}>
							<KanbanColumn
								status="TODO"
								title="Todo"
								tasks={todoTasks}
								onEditTask={handleEditTask}
								onDeleteTask={handleDeleteTask}
							/>
							<KanbanColumn
								status="IN_PROGRESS"
								title="In Progress"
								tasks={inProgressTasks}
								onEditTask={handleEditTask}
								onDeleteTask={handleDeleteTask}
							/>
							<KanbanColumn
								status="DONE"
								title="Done"
								tasks={doneTasks}
								onEditTask={handleEditTask}
								onDeleteTask={handleDeleteTask}
							/>
						</div>
					</DndContext>
				</div>
			</main>

			<TaskModal
				isOpen={isModalOpen}
				task={editingTask}
				onClose={handleCloseModal}
				onSave={handleSaveTask}
			/>

		</div>
	)
}
