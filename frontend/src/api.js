const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const getToken = () => localStorage.getItem('tf_token');

const headers = () => ({
  'Content-Type': 'application/json',
  ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {})
});

const request = async (method, path, body) => {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: headers(),
    body: body ? JSON.stringify(body) : undefined
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
};

export const api = {
  // Auth
  register: (body) => request('POST', '/auth/register', body),
  login: (body) => request('POST', '/auth/login', body),
  getMe: () => request('GET', '/auth/me'),

  // Projects
  getProjects: () => request('GET', '/projects'),
  getProject: (id) => request('GET', `/projects/${id}`),
  createProject: (body) => request('POST', '/projects', body),
  updateProject: (id, body) => request('PUT', `/projects/${id}`, body),
  deleteProject: (id) => request('DELETE', `/projects/${id}`),
  addMember: (id, body) => request('POST', `/projects/${id}/members`, body),
  removeMember: (pid, uid) => request('DELETE', `/projects/${pid}/members/${uid}`),

  // Tasks
  getProjectTasks: (projectId) => request('GET', `/projects/${projectId}/tasks`),
  createTask: (projectId, body) => request('POST', `/projects/${projectId}/tasks`, body),
  getAllTasks: () => request('GET', '/tasks'),
  updateTask: (id, body) => request('PUT', `/tasks/${id}`, body),
  deleteTask: (id) => request('DELETE', `/tasks/${id}`),
  getDashboard: () => request('GET', '/tasks/dashboard'),

  // Users (admin)
  getUsers: () => request('GET', '/users'),
  updateUserRole: (id, role) => request('PUT', `/users/${id}/role`, { role }),
  deleteUser: (id) => request('DELETE', `/users/${id}`)
};
