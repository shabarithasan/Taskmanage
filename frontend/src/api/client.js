const BASE = '/api';

function getToken() {
  return localStorage.getItem('token');
}

async function request(path, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${BASE}${path}`, { ...options, headers });

  if (res.status === 204) return null;

  const data = await res.json();
  if (!res.ok) {
    const err = new Error(data.error || 'Request failed');
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

// Auth
export const authApi = {
  register: (body) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login:    (body) => request('/auth/login',    { method: 'POST', body: JSON.stringify(body) }),
  me:       ()     => request('/auth/me'),
};

// Tasks
export const tasksApi = {
  list:   (params = {}) => {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v != null))
    ).toString();
    return request(`/tasks${qs ? `?${qs}` : ''}`);
  },
  get:    (id)   => request(`/tasks/${id}`),
  create: (body) => request('/tasks',     { method: 'POST',   body: JSON.stringify(body) }),
  update: (id, body) => request(`/tasks/${id}`, { method: 'PATCH',  body: JSON.stringify(body) }),
  remove: (id)   => request(`/tasks/${id}`, { method: 'DELETE' }),
};
