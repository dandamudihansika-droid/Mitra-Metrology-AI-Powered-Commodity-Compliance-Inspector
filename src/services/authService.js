const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

async function request(path, options) {
  const response = await fetch(`${BACKEND_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options?.headers || {}) },
    ...options
  });
  const data = await response.json();
  if (!response.ok || !data.success) throw new Error(data.error || 'Authentication request failed.');
  return data;
}

export function login(identifier, password) {
  return request('/api/auth/login', { method: 'POST', body: JSON.stringify({ identifier, password }) });
}

export function registerAccount(payload) {
  return request('/api/auth/register', { method: 'POST', body: JSON.stringify(payload) });
}

export function registerOfficer(payload) {
  return request('/api/auth/register-officer', { method: 'POST', body: JSON.stringify(payload) });
}

export function createComplaint(payload) {
  return request('/api/complaints', { method: 'POST', body: JSON.stringify(payload) });
}

export function fetchComplaints() {
  return request('/api/complaints');
}

export function updateComplaint(id, payload) {
  return request(`/api/complaints/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(payload) });
}
