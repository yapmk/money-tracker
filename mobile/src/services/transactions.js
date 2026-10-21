import api from './api';

export async function list(params = {}) {
  const { from, to } = params;
  const query = {};
  if (from) query.from = from instanceof Date ? from.toISOString() : from;
  if (to) query.to = to instanceof Date ? to.toISOString() : to;
  const { data } = await api.get('/api/transactions', { params: query });
  return data;
}

export async function create(payload) {
  const { data } = await api.post('/api/transactions', payload);
  return data;
}

export async function update(id, payload) {
  const { data } = await api.put(`/api/transactions/${id}`, payload);
  return data;
}

export async function remove(id) {
  const { data } = await api.delete(`/api/transactions/${id}`);
  return data;
}