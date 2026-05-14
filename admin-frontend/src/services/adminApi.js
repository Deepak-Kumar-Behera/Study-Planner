import axios from 'axios';

const api = axios.create({ baseURL: '/api/admin' });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const adminLogin = (email, password) =>
  api.post('/login', { email, password });

export const fetchUsers = (page = 1, limit = 10, search = '') =>
  api.get('/users', { params: { page, limit, search } });

export const fetchUserDetails = (id) =>
  api.get(`/users/${id}`);
