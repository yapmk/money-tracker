import api from './api';

export async function list() {
  const { data } = await api.get('/api/transactions');
  return data;
}

export async function create(payload) {
  const { data } = await api.post('/api/transactions', payload);
  return data;
}

export async function remove(id) {
  const { data } = await api.delete(`/api/transactions/${id}`);
  return data;
}