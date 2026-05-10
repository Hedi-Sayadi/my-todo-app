import type { Task } from '../types/task'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api/tasks'

export type TaskPayload = Omit<Task, 'id'>

type ApiErrorResponse = {
	message?: string
	error?: string
	errors?: Record<string, string>
}

async function readErrorMessage(response: Response) {
	try {
		const errorBody = (await response.json()) as ApiErrorResponse
		if (errorBody.message) return errorBody.message
		if (errorBody.error) return errorBody.error
		if (errorBody.errors) {
			return Object.entries(errorBody.errors)
				.map(([field, message]) => `${field}: ${message}`)
				.join(', ')
		}
	} catch {
		// Fall through to status text.
	}

	return response.statusText || 'Request failed'
}

async function request<T>(path = '', init?: RequestInit): Promise<T> {
	const response = await fetch(`${API_BASE_URL}${path}`, {
		headers: {
			'Content-Type': 'application/json',
			...(init?.headers ?? {}),
		},
		...init,
	})

	if (!response.ok) {
		throw new Error(await readErrorMessage(response))
	}

	if (response.status === 204) {
		return undefined as T
	}

	return (await response.json()) as T
}

function normalizePayload(task: TaskPayload) {
	return {
		...task,
		deadline: task.deadline?.trim() ? task.deadline : null,
	}
}

export async function listTasks() {
	return request<Task[]>('')
}

export async function createTask(task: TaskPayload) {
	return request<Task>('', {
		method: 'POST',
		body: JSON.stringify(normalizePayload(task)),
	})
}

export async function updateTask(id: number, task: TaskPayload) {
	return request<Task>(`/${id}`, {
		method: 'PUT',
		body: JSON.stringify(normalizePayload(task)),
	})
}

export async function deleteTask(id: number) {
	return request<void>(`/${id}`, {
		method: 'DELETE',
	})
}
