// src/core/services/api.ts

const BASE_URL = "http://localhost:3000";
const API_URL = `${BASE_URL}/auth`;

// 1. A função fetcher centraliza o tratamento de erros e o prefixo de hardware
async function fetcher(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${BASE_URL}/hardware${endpoint}`, options);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Erro ao processar requisição');
  }

  return response.json();
}

// 2. O apiService para recursos de hardware (Racks, Ativos, etc.)
export const apiService = {
  get: (endpoint: string) => 
    fetcher(endpoint, { method: 'GET' }),

  post: (endpoint: string, data: any) => 
    fetcher(endpoint, { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data) 
    }),

  patch: (endpoint: string, data: any) => 
    fetcher(endpoint, { 
      method: 'PATCH', 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data) 
    }),

  delete: (endpoint: string) => 
    fetcher(endpoint, { method: 'DELETE' }),
};

// 3. O authService para Login e Registro
export const authService = {
  async login(data: any) {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Erro ao fazer login');
    }

    return response.json();
  },

  async register(data: any) {
    const response = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Erro ao registrar');
    }

    return response.json();
  }
};