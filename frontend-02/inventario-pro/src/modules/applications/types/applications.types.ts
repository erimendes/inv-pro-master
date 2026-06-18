// src/types/applications.types.ts

// 1. Definição dos tipos estritos para as categorias e criticidades
export type SistemaCategoria = 'OPERACIONAL' | 'ADMINISTRATIVO' | 'INTERNO' | 'EXTERNO';
export type Criticidade = 'BAIXA' | 'MEDIA' | 'ALTA' | 'CRITICA';

// 2. DTO para Criação (Estrutura enviada ao backend)
export interface CreateApplicationDto {
  nome: string;
  sigla?: string;
  descricao?: string;
  categoria: SistemaCategoria;
  criticidade: Criticidade;
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

// 3. DTO para Atualização (Todos os campos do Create se tornam opcionais com Partial)
export interface UpdateApplicationDto extends Partial<CreateApplicationDto> {}

// 4. Interface Completa do Modelo (O que o backend retorna do banco de dados)
export interface Application extends CreateApplicationDto {
  id: number;
  createdAt?: string;
  updatedAt?: string;
  servidores?: Array<{
    id: number;
    hostname: string;
    ip?: string;
  }>;
}