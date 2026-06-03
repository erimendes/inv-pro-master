// /src/modules/assets/types/asset.types.ts

export type AssetTipo =
  | 'LAPTOP'
  | 'DESKTOP'
  | 'SERVIDOR_FISICO'
  | 'SERVIDOR_VIRTUAL'
  | 'SWITCH'
  | 'ROTEADOR'
  | 'STORAGE'
  | 'MONITOR';

export type AssetStatus =
  | 'DISPONIVEL'
  | 'EM_USO'
  | 'MANUTENCAO'
  | 'DESCARTADO';

export type Asset = {
  id: number;

  patrimonio?: string;

  tipo?: AssetTipo;

  fabricante?: string;
  hardware?: string;
  modelo?: string;

  serial?: string;

  hostname?: string;

  apelido?: string;

  descricao?: string;

  tag?: string;

  ipPrincipal?: string;

  sistemaOperacional?: string;

  versaoSO?: string;

  cpu?: string;

  nucleosCPU?: number;

  threadsCPU?: number;

  ram?: string;

  armazenamento?: string;

  gpu?: string;

  macAddress?: string;

  status?: AssetStatus;

  powerState?: string;

  criticidade?: string;

  emUso?: boolean;

  monitorado?: boolean;

  dataCompra?: string | Date;

  garantiaFim?: string | Date;

  valor?: number;

  fornecedor?: string;

  observacoes?: string;

  isVirtualizado?: boolean;

  hypervisor?: string;

  vmId?: string;

  cluster?: string;

  datacenter?: string;

  hostFisicoId?: number;

  userId?: string;

  rackId?: string;

  posicaoRack?: number;

  tamanhoU?: number;

  glpiId?: number;

  createdAt?: string;

  updatedAt?: string;
};

export type CreateAsset = Omit<
  Asset,
  'id' | 'createdAt' | 'updatedAt'
>;

export type UpdateAsset =
  Partial<CreateAsset>;