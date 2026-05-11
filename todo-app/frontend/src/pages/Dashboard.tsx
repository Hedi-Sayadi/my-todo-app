import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import type { Task } from '../types/task'
import TaskCard from '../components/TaskCard'
import RecommendedTask from '../components/RecommendedTask'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import { listTasks } from '../services/taskService'
import styles from './Dashboard.module.css'

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
	const [tasks, setTasks] = useState<Task[]>([])
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState('')
	useEffect(() => {
		setActiveItem(mapPathToItem(location.pathname))
	}, [location.pathname])

	useEffect(() => {
		let isMounted = true

		const loadTasks = async () => {
			try {
				setIsLoading(true)
				setError('')
				const data = await listTasks()

				if (isMounted) {
					setTasks(data)
				}
			} catch (loadError) {
				if (isMounted) {
					setError(loadError instanceof Error ? loadError.message : 'Failed to load tasks')
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

	const todoCount = tasks.filter((task) => task.status === 'TODO').length
	const inProgressCount = tasks.filter((task) => task.status === 'IN_PROGRESS').length
	const doneCount = tasks.filter((task) => task.status === 'DONE').length

	const filteredTasks = tasks.filter((task) => {
		const searchableText = [task.title, task.description, task.category.name, task.priority]
			.join(' ')
			.toLowerCase()

		return searchableText.includes(query.toLowerCase())
	})

	const recommendedTask = filteredTasks[0] ?? tasks[0]

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
						<span className={styles.summaryLabel}>Todo</span>
						<strong className={styles.summaryValue}>{todoCount}</strong>
					</div>
					<div className={styles.summaryCard}>
						<span className={styles.summaryLabel}>In progress</span>
						<strong className={styles.summaryValue}>{inProgressCount}</strong>
					</div>
					<div className={styles.summaryCard}>
						<span className={styles.summaryLabel}>Done</span>
						<strong className={styles.summaryValue}>{doneCount}</strong>
					</div>
				</section>

				<section className={styles.recommendedSection}>
					{error ? (
						<div className={styles.emptyState}>
							<p className={styles.emptyText}>{error}</p>
						</div>
					) : isLoading ? (
						<div className={styles.emptyState}>
							<p className={styles.emptyText}>Loading task overview...</p>
						</div>
					) : recommendedTask ? (
						<RecommendedTask
							task={recommendedTask}
							reason="Based on priority and deadline, this task needs your focus first."
						/>
					) : (
						<div className={styles.emptyState}>
							<p className={styles.emptyText}>No tasks yet. Create one in the Tasks page to get started.</p>
						</div>
					)}
				</section>

				<section className={styles.taskSection}>
					<div className={styles.sectionHeadingRow}>
						<div>
							<p className={styles.sectionEyebrow}>Task List</p>
							<h3 className={styles.sectionTitle}>All tasks</h3>
						</div>
						<span className={styles.taskCount}>{filteredTasks.length} shown</span>
					</div>

					{!isLoading && !error && filteredTasks.length > 0 ? (
						<div className={styles.taskGrid}>
							{filteredTasks.map((task) => (
								<TaskCard
									key={task.id}
									task={task}
								/>
							))}
						</div>
					) : !isLoading && !error ? (
						<div className={styles.emptyState}>
							<p className={styles.emptyText}>No tasks match your search.</p>
						</div>
					) : null}
				</section>
			</main>

		</div>
	)
}

export default Dashboard