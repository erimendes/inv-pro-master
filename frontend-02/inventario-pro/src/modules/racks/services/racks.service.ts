import axios from 'axios';

import type {
  Rack,
  CreateRack,
  UpdateRack,
} from '../types/rack.types';

const api = axios.create({
  baseURL: 'http://localhost:3000',
});

export const racksService = {
  async getAll(): Promise<Rack[]> {
    const response = await api.get(
      '/racks',
    );

    return response.data;
  },

  async getById(
    id: string,
  ): Promise<Rack> {
    const response = await api.get(
      `/racks/${id}`,
    );

    return response.data;
  },

  async create(data: CreateRack) {
    const response = await api.post(
      '/racks',
      data,
    );

    return response.data;
  },

  async update(
    id: string,
    data: UpdateRack,
  ) {
    const response = await api.put(
      `/racks/${id}`,
      data,
    );

    return response.data;
  },

  async remove(id: string) {
    const response = await api.delete(
      `/racks/${id}`,
    );

    return response.data;
  },
};