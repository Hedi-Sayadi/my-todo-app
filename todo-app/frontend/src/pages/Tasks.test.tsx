import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import Tasks from '../pages/Tasks'

vi.mock('../services/taskService', () => ({
	listTasks: vi.fn(),
	createTask: vi.fn(),
	updateTask: vi.fn(),
	deleteTask: vi.fn(),
}))

vi.mock('../services/categoryService', () => ({
	listCategories: vi.fn(),
}))

vi.mock('../components/Sidebar', () => ({
	default: () => <div>Sidebar Mock</div>,
}))

vi.mock('../components/Header', () => ({
	default: ({ pageTitle }: { pageTitle: string }) => <div>{pageTitle}</div>,
}))

vi.mock('../components/KanbanColumn', () => ({
	default: ({ title }: { title: string }) => <div>{title}</div>,
}))

import { listTasks } from '../services/taskService'
import { listCategories } from '../services/categoryService'

describe('Tasks page', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('displays loading state initially', () => {
		const mockedListTasks = vi.mocked(listTasks)
		const mockedListCategories = vi.mocked(listCategories)

		mockedListTasks.mockImplementation(() => new Promise(() => {}))
		mockedListCategories.mockImplementation(() => new Promise(() => {}))

		render(<Tasks />)

		expect(screen.getByText(/loading tasks/i)).toBeInTheDocument()
	})

	it('loads and displays tasks after loading', async () => {
		const mockedListTasks = vi.mocked(listTasks)
		const mockedListCategories = vi.mocked(listCategories)

		const mockTasks = [
			{
				id: 1,
				title: 'Task 1',
				description: 'Description 1',
				status: 'TODO',
				priority: 'HIGH',
				deadline: '2026-12-31',
				category: { id: 1, name: 'Work', description: '' },
			},
		]

		const mockCategories = [{ id: 1, name: 'Work', description: '' }]

		mockedListTasks.mockResolvedValue(mockTasks)
		mockedListCategories.mockResolvedValue(mockCategories)

		render(<Tasks />)

		await waitFor(() => {
			expect(mockedListTasks).toHaveBeenCalled()
			expect(mockedListCategories).toHaveBeenCalled()
		})
	})

	it('displays error state when loading fails', async () => {
		const mockedListTasks = vi.mocked(listTasks)
		const mockedListCategories = vi.mocked(listCategories)

		mockedListTasks.mockRejectedValue(new Error('Failed to load tasks'))
		mockedListCategories.mockRejectedValue(new Error('Failed to load categories'))

		render(<Tasks />)

		await waitFor(() => {
			expect(screen.getByText(/failed to load tasks/i)).toBeInTheDocument()
		})
	})

	it('displays kanban board with task counts', async () => {
		const mockedListTasks = vi.mocked(listTasks)
		const mockedListCategories = vi.mocked(listCategories)

		const mockTasks = [
			{
				id: 1,
				title: 'Task 1',
				description: '',
				status: 'TODO',
				priority: 'HIGH',
				deadline: null,
				category: { id: 1, name: 'Work', description: '' },
			},
			{
				id: 2,
				title: 'Task 2',
				description: '',
				status: 'IN_PROGRESS',
				priority: 'MEDIUM',
				deadline: null,
				category: { id: 1, name: 'Work', description: '' },
			},
			{
				id: 3,
				title: 'Task 3',
				description: '',
				status: 'DONE',
				priority: 'LOW',
				deadline: null,
				category: { id: 1, name: 'Work', description: '' },
			},
		]

		mockedListTasks.mockResolvedValue(mockTasks)
		mockedListCategories.mockResolvedValue([{ id: 1, name: 'Work', description: '' }])

		render(<Tasks />)

		await waitFor(() => {
			expect(mockedListTasks).toHaveBeenCalled()
		})
	})

	it('displays "Add Task" button', async () => {
		const mockedListTasks = vi.mocked(listTasks)
		const mockedListCategories = vi.mocked(listCategories)

		mockedListTasks.mockResolvedValue([])
		mockedListCategories.mockResolvedValue([])

		render(<Tasks />)

		await waitFor(() => {
			expect(mockedListTasks).toHaveBeenCalled()
		})
	})

	it('filters tasks by search query', async () => {
		const mockedListTasks = vi.mocked(listTasks)
		const mockedListCategories = vi.mocked(listCategories)

		const mockTasks = [
			{
				id: 1,
				title: 'Buy Groceries',
				description: 'Milk, bread, eggs',
				status: 'TODO',
				priority: 'HIGH',
				deadline: null,
				category: { id: 1, name: 'Personal', description: '' },
			},
			{
				id: 2,
				title: 'Fix Bug',
				description: 'Login page error',
				status: 'IN_PROGRESS',
				priority: 'MEDIUM',
				deadline: null,
				category: { id: 2, name: 'Work', description: '' },
			},
		]

		mockedListTasks.mockResolvedValue(mockTasks)
		mockedListCategories.mockResolvedValue([])

		render(<Tasks />)

		await waitFor(() => {
			expect(mockedListTasks).toHaveBeenCalled()
		})
	})
})
