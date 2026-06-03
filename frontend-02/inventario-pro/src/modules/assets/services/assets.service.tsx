// /src/modules/assets/services/assets.service.tsx

import axios from 'axios';

import type {
  Asset,
  CreateAsset,
  UpdateAsset,
} from '../types/asset.types';

const API_URL =
  'http://localhost:3000';

export const assetsService = {
  async getAll(): Promise<Asset[]> {
    const res = await fetch(
      `${API_URL}/assets`,
      {
        headers: {
          'Content-Type':
            'application/json',
        },
      },
    );

    if (!res.ok) {
      throw new Error(
        'Erro ao buscar ativos',
      );
    }

    return res.json() as Promise<
      Asset[]
    >;
  },

  async getById(
    id: string,
  ): Promise<Asset> {
    const res = await fetch(
      `${API_URL}/assets/${id}`,
      {
        headers: {
          'Content-Type':
            'application/json',
        },
      },
    );

    if (!res.ok) {
      throw new Error(
        'Erro ao buscar ativo',
      );
    }

    return res.json() as Promise<Asset>;
  },

  async create(
    data: CreateAsset,
  ): Promise<Asset> {
    try {
      const response =
        await axios.post(
          `${API_URL}/assets`,
          data,
          {
            headers: {
              'Content-Type':
                'application/json',
            },
          },
        );

      return response.data;
    } catch (error: any) {
      console.error(
        'ERRO COMPLETO BACKEND:',
        error.response?.data,
      );

      throw error;
    }
  },

  async update(
    id: string,
    data: UpdateAsset,
  ): Promise<Asset> {
    try {
      const response =
        await axios.patch(
          `${API_URL}/assets/${id}`,
          data,
          {
            headers: {
              'Content-Type':
                'application/json',
            },
          },
        );

      return response.data;
    } catch (error: any) {
      console.error(
        'ERRO COMPLETO BACKEND:',
        error.response?.data,
      );

      throw error;
    }
  },

  async remove(
    id: string,
  ): Promise<void> {
    const res = await fetch(
      `${API_URL}/assets/${id}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type':
            'application/json',
        },
      },
    );

    if (!res.ok) {
      throw new Error(
        'Erro ao remover ativo',
      );
    }
  },
};