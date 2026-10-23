const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

export async function apiRequest(path, { token, ...options } = {}) {
  let response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    })
  } catch {
    throw new Error('Unable to connect to the library server. Please try again.')
  }

  let result
  try {
    result = await response.json()
  } catch {
    throw new Error('The library server returned an invalid response.')
  }

  if (!response.ok) {
    throw new Error(result.message || 'The request could not be completed.')
  }
  return result
}
