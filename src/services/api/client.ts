import type { ApiError } from '../../types/api';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

export class ApiClientError extends Error {
  code: string;
  status: number;

  constructor(status: number, error: ApiError) {
    super(error.message);
    this.name = 'ApiClientError';
    this.status = status;
    this.code = error.code;
  }
}

class ApiClient {
  private async getHeaders(): Promise<Headers> {
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    const token = localStorage.getItem('accessToken');
    if (token) {
      headers.append('Authorization', 'Bearer ' + token);
    }
    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (response.status === 401) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
      throw new ApiClientError(401, { code: 'UNAUTHORIZED', message: 'Unauthorized' });
    }

    if (response.status === 403) {
      throw new ApiClientError(403, { code: 'FORBIDDEN', message: 'Access denied' });
    }

    const data = await response.json();
    
    if (!response.ok || !data.success) {
      throw new ApiClientError(response.status, data?.error || { code: 'UNKNOWN_ERROR', message: 'API Error' });
    }

    return data.data as T;
  }

  async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(BASE_URL + endpoint, {
      method: 'GET',
      headers: await this.getHeaders()
    });
    return this.handleResponse<T>(response);
  }

  async post<T>(endpoint: string, body?: unknown): Promise<T> {
    const response = await fetch(BASE_URL + endpoint, {
      method: 'POST',
      headers: await this.getHeaders(),
      body: JSON.stringify(body)
    });
    return this.handleResponse<T>(response);
  }

  async put<T>(endpoint: string, body?: unknown): Promise<T> {
    const response = await fetch(BASE_URL + endpoint, {
      method: 'PUT',
      headers: await this.getHeaders(),
      body: JSON.stringify(body)
    });
    return this.handleResponse<T>(response);
  }
  
  async patch<T>(endpoint: string, body?: unknown): Promise<T> {
    const response = await fetch(BASE_URL + endpoint, {
      method: 'PATCH',
      headers: await this.getHeaders(),
      body: JSON.stringify(body)
    });
    return this.handleResponse<T>(response);
  }

  async delete<T>(endpoint: string): Promise<T> {
    const response = await fetch(BASE_URL + endpoint, {
      method: 'DELETE',
      headers: await this.getHeaders()
    });
    return this.handleResponse<T>(response);
  }
}

export const api = new ApiClient();
