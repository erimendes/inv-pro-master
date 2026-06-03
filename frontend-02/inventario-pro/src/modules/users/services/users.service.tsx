const API_URL =
  'http://localhost:3000';

function getHeaders() {
  const token =
    localStorage.getItem('token');

  return {
    'Content-Type':
      'application/json',

    Authorization: `Bearer ${token}`,
  };
}

export const usersService = {
  // =========================
  // LISTAR
  // =========================
  async getAll() {
    const response = await fetch(
      `${API_URL}/users`,
      {
        headers: getHeaders(),
      },
    );

    if (!response.ok) {
      throw new Error(
        'Erro ao buscar usuários',
      );
    }

    return response.json();
  },

  // =========================
  // DETALHES
  // =========================
  async getById(id: string) {
    const response = await fetch(
      `${API_URL}/users/${id}`,
      {
        headers: getHeaders(),
      },
    );

    if (!response.ok) {
      throw new Error(
        'Erro ao buscar usuário',
      );
    }

    return response.json();
  },

  // =========================
  // CRIAR
  // =========================
  async create(data: any) {
    const response = await fetch(
      `${API_URL}/users`,
      {
        method: 'POST',

        headers: getHeaders(),

        body: JSON.stringify(data),
      },
    );

    if (!response.ok) {
      throw new Error(
        'Erro ao criar usuário',
      );
    }

    return response.json();
  },

  // =========================
  // EDITAR
  // =========================
  async update(
    id: string,
    data: any,
  ) {
    const response = await fetch(
      `${API_URL}/users/${id}`,
      {
        method: 'PATCH',

        headers: getHeaders(),

        body: JSON.stringify(data),
      },
    );

    if (!response.ok) {
      throw new Error(
        'Erro ao atualizar usuário',
      );
    }

    return response.json();
  },

  // =========================
  // DELETE
  // =========================
  async remove(id: string) {
    const response = await fetch(
      `${API_URL}/users/${id}`,
      {
        method: 'DELETE',

        headers: getHeaders(),
      },
    );

    if (!response.ok) {
      throw new Error(
        'Erro ao remover usuário',
      );
    }

    return true;
  },
};