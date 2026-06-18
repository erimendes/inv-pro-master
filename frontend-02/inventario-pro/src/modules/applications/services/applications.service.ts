// src/services/applications.service.ts
import axios from 'axios'; 

// O "import type" garante que o compilador do Vite remova isso no bundle final
import type { 
  Application, 
  CreateApplicationDto, 
  UpdateApplicationDto, 
  SistemaCategoria, 
  Criticidade 
} from '../types/applications.types';

const API_URL = 'http://localhost:3000/aplicacoes'; 

export const applicationsService = {
  // Busca todas as aplicações (permite filtros opcionais por categoria e criticidade)
  findAll: async (categoria?: SistemaCategoria, criticidade?: Criticidade): Promise<Application[]> => {
    const response = await axios.get<Application[]>(API_URL, {
      params: { categoria, criticidade },
    });
    return response.data;
  },

  // Busca uma aplicação específica pelo ID
  findOne: async (id: number): Promise<Application> => {
    const response = await axios.get<Application>(`${API_URL}/${id}`);
    return response.data;
  },

  // Envia os dados para criar uma nova aplicação
  create: async (data: CreateApplicationDto): Promise<Application> => {
    const response = await axios.post<Application>(API_URL, data);
    return response.data;
  },

  // Atualiza dados parciais de uma aplicação existente
  update: async (id: number, data: UpdateApplicationDto): Promise<Application> => {
    const response = await axios.put<Application>(`${API_URL}/${id}`, data);
    return response.data;
  },

  // Remove uma aplicação pelo ID
  remove: async (id: number): Promise<void> => {
    await axios.delete(`${API_URL}/${id}`);
  },
};