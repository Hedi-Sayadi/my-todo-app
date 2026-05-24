import type { Task } from '../types/task';
import { apiRequest } from './api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api';

export type TaskPayload = {
  title: string;
  description: string;
  priority: Task['priority'];
  deadline: string | null;
  categoryId: number;
  status: Task['status'];
};

function normalizePayload(task: TaskPayload) {
  return {
    ...task,
    deadline: task.deadline?.trim() ? task.deadline : null,
  };
}

export async function listTasks() {
  return apiRequest<Task[]>(`${API_BASE_URL}/tasks`);
}

export async function createTask(task: TaskPayload) {
  return apiRequest<Task>(`${API_BASE_URL}/tasks`, '', {
    method: 'POST',
    body: JSON.stringify(normalizePayload(task)),
  });
}

export async function updateTask(id: number, task: TaskPayload) {
  return apiRequest<Task>(`${API_BASE_URL}/tasks`, `/${id}`, {
    method: 'PUT',
    body: JSON.stringify(normalizePayload(task)),
  });
}

export async function deleteTask(id: number) {
  return apiRequest<void>(`${API_BASE_URL}/tasks`, `/${id}`, {
    method: 'DELETE',
  });
}
