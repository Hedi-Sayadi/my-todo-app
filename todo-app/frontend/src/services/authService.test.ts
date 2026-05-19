import { beforeEach, describe, expect, it, vi } from 'vitest'
import { clearStoredSession, getActiveSession, getStoredSession, login, register } from './authService'
import { apiRequest } from './api'

vi.mock('./api', () => ({
	apiRequest: vi.fn(),
}))

describe('authService', () => {
	beforeEach(() => {
		window.localStorage.clear()
		vi.clearAllMocks()
	})

	it('returns null when no session is stored', () => {
		expect(getStoredSession()).toBeNull()
	})

	it('returns null when stored session JSON is invalid', () => {
		window.localStorage.setItem('todo-app-auth', '{invalid-json')
		expect(getStoredSession()).toBeNull()
	})

	it('removes expired session and returns null', () => {
		window.localStorage.setItem(
			'todo-app-auth',
			JSON.stringify({
				token: 'token',
				user: { id: 1 },
				expiresAt: Date.now() - 1000,
			})
		)

		expect(getActiveSession()).toBeNull()
		expect(window.localStorage.getItem('todo-app-auth')).toBeNull()
	})

	it('returns active session when not expired', () => {
		window.localStorage.setItem(
			'todo-app-auth',
			JSON.stringify({
				token: 'token',
				user: { id: 1 },
				expiresAt: Date.now() + 60_000,
			})
		)

		const session = getActiveSession()
		expect(session).not.toBeNull()
		expect(session?.token).toBe('token')
	})

	it('clears stored session explicitly', () => {
		window.localStorage.setItem('todo-app-auth', JSON.stringify({ token: 'token' }))
		clearStoredSession()
		expect(window.localStorage.getItem('todo-app-auth')).toBeNull()
	})

	it('login saves and returns session', async () => {
		const mockedApiRequest = vi.mocked(apiRequest)
		mockedApiRequest.mockResolvedValue({
			token: 'jwt-token',
			tokenType: 'Bearer',
			expiresInMillis: 3_600_000,
			user: {
				id: 1,
				firstName: 'Hedi',
				lastName: 'Sayadi',
				email: 'hedi@example.com',
				role: 'USER',
				createdAt: '2026-01-01T00:00:00Z',
				updatedAt: '2026-01-01T00:00:00Z',
			},
		})

		const before = Date.now()
		const session = await login({ email: 'hedi@example.com', password: 'secret' })

		expect(mockedApiRequest).toHaveBeenCalledWith('/api/auth', '/login', {
			method: 'POST',
			body: JSON.stringify({ email: 'hedi@example.com', password: 'secret' }),
		})
		expect(session.token).toBe('jwt-token')
		expect(session.expiresAt).toBeGreaterThanOrEqual(before + 3_599_000)
		expect(getStoredSession()?.token).toBe('jwt-token')
	})

	it('register calls register endpoint and stores session', async () => {
		const mockedApiRequest = vi.mocked(apiRequest)
		mockedApiRequest.mockResolvedValue({
			token: 'register-token',
			tokenType: 'Bearer',
			expiresInMillis: 60_000,
			user: {
				id: 2,
				firstName: 'New',
				lastName: 'User',
				email: 'new@example.com',
				role: 'USER',
				createdAt: '2026-01-01T00:00:00Z',
				updatedAt: '2026-01-01T00:00:00Z',
			},
		})

		await register({
			firstName: 'New',
			lastName: 'User',
			email: 'new@example.com',
			password: 'secret',
			confirmPassword: 'secret',
		})

		expect(mockedApiRequest).toHaveBeenCalledWith('/api/auth', '/register', expect.any(Object))
		expect(getStoredSession()?.token).toBe('register-token')
	})
})
