import * as SecureStore from 'expo-secure-store';
import api from './api';

export async function register(name, email, password) {
  const { data } = await api.post('/api/auth/register', { name, email, password });
  return data;
}

export async function login(email, password) {
  const { data } = await api.post('/api/auth/login', { email, password });
  return data;
}

export async function saveToken(token) {
  await SecureStore.setItemAsync('token', token);
}

export async function getToken() {
  return SecureStore.getItemAsync('token');
}

export async function clearToken() {
  await SecureStore.deleteItemAsync('token');
}