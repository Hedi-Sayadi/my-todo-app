import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createTask, deleteTask, listTasks, updateTask } from './taskService'
import { apiRequest } from './api'

vi.mock('./api', () => ({
	apiRequest: vi.fn(),
}))

describe('taskService', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	describe('listTasks', () => {
		it('fetches all tasks from API', async () => {
			const mockedApiRequest = vi.mocked(apiRequest)
			const mockTasks = [
				{
					id: 1,
					title: 'Task 1',
					description: 'Desc 1',
					status: 'TODO',
					priority: 'HIGH',
					deadline: '2026-12-31',
					category: { id: 1, name: 'Work', description: '' },
				},
				{
					id: 2,
					title: 'Task 2',
					description: 'Desc 2',
					status: 'IN_PROGRESS',
					priority: 'MEDIUM',
					deadline: null,
					category: { id: 2, name: 'Personal', description: '' },
				},
			]

			mockedApiRequest.mockResolvedValue(mockTasks)

			const tasks = await listTasks()

			expect(mockedApiRequest).toHaveBeenCalledWith('/api/tasks')
			expect(tasks).toEqual(mockTasks)
			expect(tasks).toHaveLength(2)
		})

		it('returns empty array on error', async () => {
			const mockedApiRequest = vi.mocked(apiRequest)
			mockedApiRequest.mockRejectedValue(new Error('Network error'))

			await expect(listTasks()).rejects.toThrow('Network error')
		})
	})

	describe('createTask', () => {
		it('creates a new task via API', async () => {
			const mockedApiRequest = vi.mocked(apiRequest)
			const newTask = {
				title: 'New Task',
				description: 'New Description',
				priority: 'HIGH',
				deadline: '2026-06-30',
				categoryId: 1,
			}
			const createdTask = {
				id: 3,
				...newTask,
				status: 'TODO',
				category: { id: 1, name: 'Work', description: '' },
			}

			mockedApiRequest.mockResolvedValue(createdTask)

			const result = await createTask(newTask)

			expect(mockedApiRequest).toHaveBeenCalledWith('/api/tasks', '', {
				method: 'POST',
				body: JSON.stringify(newTask),
			})
			expect(result).toEqual(createdTask)
			expect(result.id).toBe(3)
		})

		it('throws error on validation failure', async () => {
			const mockedApiRequest = vi.mocked(apiRequest)
			const invalidTask = { title: '', categoryId: 1 }

			mockedApiRequest.mockRejectedValue(new Error('Title is required'))

			await expect(createTask(invalidTask as any)).rejects.toThrow('Title is required')
		})
	})

	describe('updateTask', () => {
		it('updates an existing task', async () => {
			const mockedApiRequest = vi.mocked(apiRequest)
			const updatePayload = {
				title: 'Updated Title',
				description: 'Original desc',
				status: 'DONE',
				priority: 'LOW',
				deadline: null,
				categoryId: 1,
			}
			const updatedTask = {
				id: 1,
				...updatePayload,
				category: { id: 1, name: 'Work', description: '' },
			}

			mockedApiRequest.mockResolvedValue(updatedTask)

			const result = await updateTask(1, updatePayload as any)

			expect(mockedApiRequest).toHaveBeenCalledWith('/api/tasks', '/1', {
				method: 'PUT',
				body: JSON.stringify(updatePayload),
			})
			expect(result.status).toBe('DONE')
		})

		it('handles 404 when task not found', async () => {
			const mockedApiRequest = vi.mocked(apiRequest)
			mockedApiRequest.mockRejectedValue(new Error('Task not found'))

			await expect(updateTask(999, { title: 'Update' } as any)).rejects.toThrow('Task not found')
		})
	})

	describe('deleteTask', () => {
		it('deletes a task by ID', async () => {
			const mockedApiRequest = vi.mocked(apiRequest)
			mockedApiRequest.mockResolvedValue(undefined)

			await deleteTask(1)

			expect(mockedApiRequest).toHaveBeenCalledWith('/api/tasks', '/1', { method: 'DELETE' })
		})

		it('handles deletion error', async () => {
			const mockedApiRequest = vi.mocked(apiRequest)
			mockedApiRequest.mockRejectedValue(new Error('Cannot delete task'))

			await expect(deleteTask(1)).rejects.toThrow('Cannot delete task')
		})
	})
})
