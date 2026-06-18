// src/auth/services/auth.service.ts
const API_URL = 'http://localhost:3000';

export const authService = {
  // 💡 CORREÇÃO: O parâmetro agora aceita email OU username como opcionais, mas exige a senha
  async login(data: { email?: string; username?: string; password: string }) {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!res.ok) throw new Error('Erro ao fazer login');

    return res.json(); // retorna token + user
  },

  async register(data: {
    email: string;
    password: string;
    name: string;
    role?: string;
  }) {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...data,
        role: data.role || 'USER', // garante valor padrão
      }),
    });

    if (res.status === 409) {
      throw new Error('Usuário já existe');
    }

    if (!res.ok) {
      throw new Error('Erro ao registrar');
    }

    return res.json();
  }
};