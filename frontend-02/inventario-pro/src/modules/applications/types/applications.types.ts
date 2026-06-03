// src/types/applications.types.ts

// 1. Declaramos e exportamos os tipos para os filtros aceitarem
export type SistemaCategoria = 'OPERACIONAL' | 'ADMINISTRATIVO' | 'INTERNO' | 'EXTERNO';
export type Criticidade = 'BAIXA' | 'MEDIA' | 'ALTA' | 'CRITICA';

export interface CreateApplicationDto {
  nome: string;
  sigla?: string;
  descricao?: string;
  categoria: SistemaCategoria; // 💡 Passa a usar o tipo exportado acima
  criticidade: Criticidade;     // 💡 Passa a usar o tipo exportado acima
  businessOwner?: string;
  responsavelTecnico?: string;
  contatoFuncional?: string;
  fornecedor?: string;
  janelaOperacao?: string;
  backupInfo?: string;
  procedimentoRecup?: string;
  pontoUnicoFalha?: string;
  tecnologiaPrincipal?: string;
  databaseInfo?: string;
  integracoes?: string;
  servidoresIds?: number[]; 
}

export interface UpdateApplicationDto extends Partial<CreateApplicationDto> {}