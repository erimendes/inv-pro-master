import axios from 'axios'; 
// Use "import type" para garantir que o Vite ignore isso no bundle JavaScript final
import type { Application, CreateApplicationDto, UpdateApplicationDto, SistemaCategoria, Criticidade } from '../types/applications.types';

const API_URL = 'http://localhost:3000/aplicacoes'; 

// ... restante do seu service igual

export const applicationsService = {
  findAll: async (categoria?: SistemaCategoria, criticidade?: Criticidade): Promise<Application[]> => {
    const response = await axios.get<Application[]>(API_URL, {
      params: { categoria, criticidade },
    });
    return response.data;
  },

  findOne: async (id: number): Promise<Application> => {
    const response = await axios.get<Application>(`${API_URL}/${id}`);
    return response.data;
  },

  create: async (data: CreateApplicationDto): Promise<Application> => {
    const response = await axios.post<Application>(API_URL, data);
    return response.data;
  },

  update: async (id: number, data: UpdateApplicationDto): Promise<Application> => {
    const response = await axios.put<Application>(`${API_URL}/${id}`, data);
    return response.data;
  },

  remove: async (id: number): Promise<void> => {
    await axios.delete(`${API_URL}/${id}`);
  },
};
