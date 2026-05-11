import type { Reminder, ReminderStatus } from '../types/reminder'
import { apiRequest } from './api'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api'

export type ReminderPayload = {
	taskId: number
	reminderAt: string
	note: string
	status: ReminderStatus
}

export type ReminderSnoozePayload = {
	minutes: number
}

function normalizeReminderPayload(payload: ReminderPayload) {
	return {
		...payload,
		note: payload.note.trim() || null,
	}
}

export async function listReminders() {
	return apiRequest<Reminder[]>(`${API_BASE_URL}/reminders`)
}

export async function createReminder(payload: ReminderPayload) {
	return apiRequest<Reminder>(`${API_BASE_URL}/reminders`, '', {
		method: 'POST',
		body: JSON.stringify(normalizeReminderPayload(payload)),
	})
}

export async function updateReminder(id: number, payload: ReminderPayload) {
	return apiRequest<Reminder>(`${API_BASE_URL}/reminders`, `/${id}`, {
		method: 'PUT',
		body: JSON.stringify(normalizeReminderPayload(payload)),
	})
}

export async function deleteReminder(id: number) {
	return apiRequest<void>(`${API_BASE_URL}/reminders`, `/${id}`, {
		method: 'DELETE',
	})
}

export async function snoozeReminder(id: number, payload: ReminderSnoozePayload) {
	return apiRequest<Reminder>(`${API_BASE_URL}/reminders`, `/${id}/snooze`, {
		method: 'PUT',
		body: JSON.stringify(payload),
	})
}

export async function markReminderDone(id: number) {
	return apiRequest<Reminder>(`${API_BASE_URL}/reminders`, `/${id}/done`, {
		method: 'PUT',
	})
}