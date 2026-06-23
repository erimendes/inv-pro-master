// src/modules/assets/services/assets.service.tsx
import axios from 'axios';

import type {
  Asset,
  CreateAsset,
  UpdateAsset,
} from '../types/asset.types';

const API_URL = 'http://localhost:3000';

export const assetsService = {
  // 🟢 Corrigido: Agora injeta o token e trata possíveis envelopamentos da API
  async getAll(): Promise<Asset[]> {
    const token = localStorage.getItem('token');
    const res = await fetch(
      `${API_URL}/assets`,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // 🔑 Injetado Token de Segurança
        },
      },
    );

    if (!res.ok) {
      throw new Error('Erro ao buscar ativos');
    }

    const resData = await res.json();
    
    // Desembrulha o JSON caso o backend envie como { data: [...] } ou { assets: [...] }
    if (Array.isArray(resData)) return resData as Asset[];
    if (resData && Array.isArray(resData.data)) return resData.data as Asset[];
    if (resData && Array.isArray(resData.assets)) return resData.assets as Asset[];
    return [];
  },

  async getById(id: string | number): Promise<Asset> {
    const token = localStorage.getItem('token');
    const res = await fetch(
      `${API_URL}/assets/${id}`,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // 🔑 Injetado Token de Segurança
        },
      },
    );

    if (!res.ok) {
      throw new Error('Erro ao buscar ativo');
    }

    const resData = await res.json();
    // Desembrulha caso venha dentro de um objeto data
    return (resData?.data ? resData.data : resData) as Asset;
  },

  async create(data: CreateAsset): Promise<Asset> {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/assets`,
        data,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`, // 🔑 Injetado Token de Segurança
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

  async update(id: string | number, data: UpdateAsset): Promise<Asset> {
    try {
      const token = localStorage.getItem('token');
      // Suporta tanto PUT quanto PATCH se o backend tiver variações
      const response = await axios.put(
        `${API_URL}/assets/${id}`,
        data,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`, // 🔑 Injetado Token de Segurança
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

  async remove(id: string | number): Promise<void> {
    const token = localStorage.getItem('token');
    const res = await fetch(
      `${API_URL}/assets/${id}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // 🔑 Injetado Token de Segurança
        },
      },
    );

    if (!res.ok) {
      throw new Error('Erro ao remover ativo');
    }
  },
};