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
		// Fall through to the generic response text.
	}

	return response.statusText || 'Request failed'
}

export async function apiRequest<T>(baseUrl: string, path = '', init?: RequestInit): Promise<T> {
	const response = await fetch(`${baseUrl}${path}`, {
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