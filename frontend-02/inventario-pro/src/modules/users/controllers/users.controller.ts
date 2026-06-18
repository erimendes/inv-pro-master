import {
  useEffect,
  useState,
} from 'react';

import { usersService }
from '../services/users.service';

import type { User }
from '../types/users.types';

export function useUsersController() {
  const [loading, setLoading] =
    useState(true);

  const [users, setUsers] =
    useState<User[]>([]);

  const [error, setError] =
    useState('');

  async function loadUsers() {
    try {
      setLoading(true);

      const data =
        await usersService.getAll();

      setUsers(data);
    } catch (error) {
      console.error(error);

      setError(
        'Erro ao carregar usuários',
      );
    } finally {
      setLoading(false);
    }
  }

  async function deleteUser(
    id: string,
  ) {
    const confirmed = confirm(
      'Deseja remover este usuário?',
    );

    if (!confirmed) return;

    try {
      await usersService.remove(id);

      setUsers((prev) =>
        prev.filter(
          (user) =>
            user.id !== id,
        ),
      );
    } catch (error) {
      console.error(error);

      alert(
        'Erro ao remover usuário',
      );
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  return {
    users,
    loading,
    error,
    deleteUser,
  };
}