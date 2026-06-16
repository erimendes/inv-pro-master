import { Criticidade, SistemaCategoria } from '../../../../generated/prisma/client';
export declare class CreateApplicationDto {
    nome: string;
    sigla?: string;
    descricao?: string;
    categoria?: SistemaCategoria;
    criticidade?: Criticidade;
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
