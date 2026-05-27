const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5056/api';

export async function apiRequest(path, options = {}) {
  const token = localStorage.getItem('biblioteca.token');
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers ?? {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    localStorage.removeItem('biblioteca.token');
  }

  const text = await response.text();
  const data = text ? parsePayload(text) : null;

  if (!response.ok) {
    const message = typeof data === 'string'
      ? data
      : data?.title ?? data?.message ?? 'Não foi possível concluir a ação.';
    throw new Error(message);
  }

  return data;
}

function parsePayload(text) {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}
