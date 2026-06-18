import {
  useEffect,
  useState,
} from 'react';

import { useParams }
from 'react-router-dom';

import { usersService }
from '../services/users.service';

import type { User }
from '../types/users.types';

export function useUserDetailsController() {
  const { id } = useParams();

  const [loading, setLoading] =
    useState(true);

  const [user, setUser] =
    useState<User | null>(null);

  const [error, setError] =
    useState('');

  async function loadUser() {
    try {
      if (!id) return;

      setLoading(true);

      const data =
        await usersService.getById(
          id,
        );

      setUser(data);
    } catch (error) {
      console.error(error);

      setError(
        'Erro ao carregar usuário',
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUser();
  }, [id]);

  return {
    id,
    user,
    loading,
    error,
  };
}