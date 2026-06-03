export type Rack = {
  id: string;

  nome: string;

  localizacao?: string | null;

  capacidade: number;

  createdAt?: string;

  updatedAt?: string;
};

export type CreateRack = Omit<
  Rack,
  'id' | 'createdAt' | 'updatedAt'
>;

export type UpdateRack =
  Partial<CreateRack>;