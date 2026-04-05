import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const login = (data) => api.post('/users/login', data);
export const register = (data) => api.post('/users/register', data);

// Users
export const getAllUsers = () => api.get('/users');
export const updateUserRole = (id, role) => api.put(`/users/${id}/role`, { role });

// Issues
export const getAllIssues = () => api.get('/issues');
export const getIssueById = (id) => api.get(`/issues/${id}`);
export const createIssue = (data) => api.post('/issues', data);
export const assignIssue = (data) => api.post('/issues/assign', data);
export const updateStatus = (data) => api.put('/issues/status', data);
export const filterIssues = (params) => api.get('/issues/filter', { params });

// Comments
export const addComment = (data) => api.post('/comments', data);
export const getCommentsByIssue = (issueId) => api.get(`/comments/issue/${issueId}`);

export default api;
