export type Asset = {
  id: number;

  hostname: string;

  hardware?: string;

  ipRede?: string;

  sistOper?: string;

  patrimonio?: string;

  cpu?: string;

  ram?: string;

  discoFisico?: string;

  posicaoRack?: number;

  isVirtualizado?: boolean;

  rack?: {
    id: string;
    nome: string;
  };
};
