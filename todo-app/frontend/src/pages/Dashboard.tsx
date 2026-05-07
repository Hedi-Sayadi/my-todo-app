import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import type { Task } from '../types/task'
import TaskCard from '../components/TaskCard'
import RecommendedTask from '../components/RecommendedTask'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import styles from './Dashboard.module.css'

const tasks: Task[] = [
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

function Dashboard() {
	const location = useLocation()

	const mapPathToItem = (path: string) => {
		if (path === '/' || path === '') return 'Dashboard'
		if (path.startsWith('/tasks')) return 'Tasks'
		if (path.startsWith('/categories')) return 'Categories'
		if (path.startsWith('/reminders')) return 'Reminders'
		if (path.startsWith('/settings')) return 'Settings'
		return 'Dashboard'
	}

	const [query, setQuery] = useState('')
	const [activeItem, setActiveItem] = useState(() => mapPathToItem(location.pathname))
	useEffect(() => {
		setActiveItem(mapPathToItem(location.pathname))
	}, [location.pathname])

	const completedCount = tasks.filter((task) => task.completed).length
	const remainingCount = tasks.length - completedCount
	const dueSoonCount = tasks.filter((task) => !task.completed).length

	const filteredTasks = tasks.filter((task) => {
		const searchableText = [task.title, task.description, task.category, task.priority]
			.join(' ')
			.toLowerCase()

		return searchableText.includes(query.toLowerCase())
	})

	const recommendedTask = filteredTasks[0] ?? tasks[0]

	const handleToggleComplete = (id: number) => {
		console.log('toggle complete', id)
	}

	const handleEdit = (task: Task) => {
		console.log('edit task', task)
	}

	const handleDelete = (id: number) => {
		console.log('delete task', id)
	}

	const handleStartTask = (task: Task) => {
		console.log('start task', task)
	}

	return (
		<div className={styles.shell}>
			<Sidebar activeItem={activeItem} onItemSelect={setActiveItem} />

			<main className={styles.main}>
				<Header pageTitle="Task dashboard" searchValue={query} onSearchChange={setQuery} />

				<section className={styles.summaryGrid} aria-label="Task summary">
					<div className={styles.summaryCard}>
						<span className={styles.summaryLabel}>All tasks</span>
						<strong className={styles.summaryValue}>{tasks.length}</strong>
					</div>
					<div className={styles.summaryCard}>
						<span className={styles.summaryLabel}>Completed</span>
						<strong className={styles.summaryValue}>{completedCount}</strong>
					</div>
					<div className={styles.summaryCard}>
						<span className={styles.summaryLabel}>Remaining</span>
						<strong className={styles.summaryValue}>{remainingCount}</strong>
					</div>
					<div className={styles.summaryCard}>
						<span className={styles.summaryLabel}>Due soon</span>
						<strong className={styles.summaryValue}>{dueSoonCount}</strong>
					</div>
				</section>

				<section className={styles.recommendedSection}>
					<RecommendedTask
						task={recommendedTask}
						reason="Based on priority and deadline, this task needs your focus first."
						onStart={handleStartTask}
					/>
				</section>

				<section className={styles.taskSection}>
					<div className={styles.sectionHeadingRow}>
						<div>
							<p className={styles.sectionEyebrow}>Task List</p>
							<h3 className={styles.sectionTitle}>All tasks</h3>
						</div>
						<span className={styles.taskCount}>{filteredTasks.length} shown</span>
					</div>

					<div className={styles.taskGrid}>
						{filteredTasks.map((task) => (
							<TaskCard
								key={task.id}
								task={task}
								onToggleComplete={handleToggleComplete}
								onEdit={handleEdit}
								onDelete={handleDelete}
							/>
						))}
					</div>
				</section>
			</main>

			<button type="button" className={styles.floatingAction}>
				Add Task
			</button>
		</div>
	)
}

export default Dashboard