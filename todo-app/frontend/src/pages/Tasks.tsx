import { useState } from 'react'
import type { Task } from '../types/task'
import TaskCard from '../components/TaskCard'
import TaskModal from '../components/TaskModal'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
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
		completed: false,
	},
	{
		id: 2,
		title: 'Set up initial component structure',
		description: 'Created reusable components and a task model for the frontend.',
		priority: 'MEDIUM',
		deadline: '2026-05-08',
		category: 'Setup',
		completed: true,
	},
	{
		id: 3,
		title: 'Draft the task creation flow',
		description: 'Design a minimal modal or panel for adding new tasks quickly.',
		priority: 'LOW',
		deadline: '2026-05-14',
		category: 'UX',
		completed: false,
	},
	{
		id: 4,
		title: 'Review state management approach',
		description: 'Compare local state, context, or a lightweight store for the next step.',
		priority: 'MEDIUM',
		deadline: '2026-05-18',
		category: 'Architecture',
		completed: false,
	},
]

export default function Tasks() {
	const [tasks, setTasks] = useState(initialTasks)
	const [isModalOpen, setIsModalOpen] = useState(false)
	const [editingTask, setEditingTask] = useState<Task | null>(null)
	const [query, setQuery] = useState('')

	const filteredTasks = tasks.filter((task) => {
		const searchableText = [task.title, task.description, task.category, task.priority]
			.join(' ')
			.toLowerCase()
		return searchableText.includes(query.toLowerCase())
	})

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

	const handleToggleComplete = (id: number) => {
		setTasks((prev) =>
			prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
		)
	}

	const handleDeleteTask = (id: number) => {
		setTasks((prev) => prev.filter((t) => t.id !== id))
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
							<h2 className={styles.title}>All Tasks</h2>
						</div>
						<button className={styles.createButton} onClick={handleOpenModal} type="button">
							<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
								<line x1="12" y1="5" x2="12" y2="19" />
								<line x1="5" y1="12" x2="19" y2="12" />
							</svg>
							New Task
						</button>
					</div>

					<div className={styles.stats}>
						<div className={styles.statCard}>
							<span className={styles.statLabel}>Total</span>
							<strong className={styles.statValue}>{tasks.length}</strong>
						</div>
						<div className={styles.statCard}>
							<span className={styles.statLabel}>Completed</span>
							<strong className={styles.statValue}>
								{tasks.filter((t) => t.completed).length}
							</strong>
						</div>
						<div className={styles.statCard}>
							<span className={styles.statLabel}>Active</span>
							<strong className={styles.statValue}>
								{tasks.filter((t) => !t.completed).length}
							</strong>
						</div>
					</div>

					{filteredTasks.length > 0 ? (
						<div className={styles.taskGrid}>
							{filteredTasks.map((task) => (
								<TaskCard
									key={task.id}
									task={task}
									onToggleComplete={() => handleToggleComplete(task.id)}
									onEdit={() => handleEditTask(task)}
									onDelete={() => handleDeleteTask(task.id)}
								/>
							))}
						</div>
					) : (
						<div className={styles.emptyState}>
							<p className={styles.emptyText}>No tasks match your search.</p>
							<button className={styles.emptyButton} onClick={handleOpenModal} type="button">
								Create your first task
							</button>
						</div>
					)}
				</div>
			</main>

			<TaskModal
				isOpen={isModalOpen}
				task={editingTask}
				onClose={handleCloseModal}
				onSave={handleSaveTask}
			/>

			<button type="button" className={styles.floatingAction} onClick={handleOpenModal}>
				+
			</button>
		</div>
	)
}
