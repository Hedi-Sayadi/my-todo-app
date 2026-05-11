import { apiRequest } from './api'
import type { AuthResponse, AuthSession, LoginRequest, RegisterRequest } from '../types/user'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api'
const AUTH_STORAGE_KEY = 'todo-app-auth'

function saveSession(response: AuthResponse): AuthSession {
	const session: AuthSession = {
		token: response.token,
		user: response.user,
		expiresAt: Date.now() + response.expiresInMillis,
	}

	window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session))
	return session
}

export function getStoredSession() {
	if (typeof window === 'undefined') return null

	try {
		const rawValue = window.localStorage.getItem(AUTH_STORAGE_KEY)
		return rawValue ? (JSON.parse(rawValue) as AuthSession) : null
	} catch {
		return null
	}
}

export function getActiveSession() {
	const session = getStoredSession()
	if (!session) return null

	if (session.expiresAt <= Date.now()) {
		clearStoredSession()
		return null
	}

	return session
}

export function clearStoredSession() {
	if (typeof window === 'undefined') return
	window.localStorage.removeItem(AUTH_STORAGE_KEY)
}

export async function login(request: LoginRequest) {
	const response = await apiRequest<AuthResponse>(`${API_BASE_URL}/auth`, '/login', {
		method: 'POST',
		body: JSON.stringify(request),
	})

	return saveSession(response)
}

export async function register(request: RegisterRequest) {
	const response = await apiRequest<AuthResponse>(`${API_BASE_URL}/auth`, '/register', {
		method: 'POST',
		body: JSON.stringify(request),
	})

	return saveSession(response)
}