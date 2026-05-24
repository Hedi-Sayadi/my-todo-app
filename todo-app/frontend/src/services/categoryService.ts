import type { Category } from '../types/category';
import { apiRequest } from './api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api';

export type CategoryPayload = {
  name: string;
  description: string;
};

export async function listCategories() {
  return apiRequest<Category[]>(`${API_BASE_URL}/categories`);
}

export async function createCategory(category: CategoryPayload) {
  return apiRequest<Category>(`${API_BASE_URL}/categories`, '', {
    method: 'POST',
    body: JSON.stringify(category),
  });
}

export async function updateCategory(id: number, category: CategoryPayload) {
  return apiRequest<Category>(`${API_BASE_URL}/categories`, `/${id}`, {
    method: 'PUT',
    body: JSON.stringify(category),
  });
}

export async function deleteCategory(id: number) {
  return apiRequest<void>(`${API_BASE_URL}/categories`, `/${id}`, {
    method: 'DELETE',
  });
}
