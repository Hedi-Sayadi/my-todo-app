type ApiErrorResponse = {
	message?: string
	error?: string
	errors?: Record<string, string>
}

const AUTH_STORAGE_KEY = 'todo-app-auth'

type AuthStorage = {
	token: string
}

function readAuthStorage() {
	if (typeof window === 'undefined') return null

	try {
		const storedValue = window.localStorage.getItem(AUTH_STORAGE_KEY)
		return storedValue ? (JSON.parse(storedValue) as AuthStorage) : null
	} catch {
		return null
	}
}

async function readErrorMessage(response: Response) {
	const contentType = response.headers.get('content-type') ?? ''

	try {
		if (contentType.includes('application/json')) {
			const errorBody = (await response.json()) as ApiErrorResponse
			if (errorBody.message) return errorBody.message
			if (errorBody.error) return errorBody.error
			if (errorBody.errors) {
				return Object.entries(errorBody.errors)
					.map(([field, message]) => `${field}: ${message}`)
					.join(', ')
			}
		} else {
			const errorText = await response.text()
			if (errorText.trim()) {
				return errorText.replace(/\s+/g, ' ').slice(0, 180)
			}
		}
	} catch {
		// Fall through to the generic response text.
	}

	return response.statusText || 'Request failed'
}

export async function apiRequest<T>(baseUrl: string, path = '', init?: RequestInit): Promise<T> {
	const auth = readAuthStorage()
	const response = await fetch(`${baseUrl}${path}`, {
		headers: {
			'Content-Type': 'application/json',
			...(auth?.token ? { Authorization: `Bearer ${auth.token}` } : {}),
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

	const contentType = response.headers.get('content-type') ?? ''
	if (!contentType.includes('application/json')) {
		const responseText = await response.text()
		throw new Error(
			`Expected JSON from ${response.url || `${baseUrl}${path}`}, but received ${contentType || 'unknown content type'}: ${responseText.replace(/\s+/g, ' ').slice(0, 180)}`,
		)
	}

	return (await response.json()) as T
}