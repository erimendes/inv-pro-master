import { AtivoTipo, AtivoStatus } from '../../../../generated/prisma/client';
export declare class CreateInventoryDto {
    tagPatrimonial: string;
    tipo?: AtivoTipo;
    fabricante: string;
    modelo: string;
    numSerie: string;
    hostname?: string;
    cpu?: string;
    ram?: string;
    discoFisico?: string;
    status?: AtivoStatus;
    emUso?: boolean;
    dataCompra?: string;
    valor?: number;
    isVirtualizado?: boolean;
    hyperVName?: string;
    hostFisicoId?: number;
    userId?: string;
    observacoes?: string;
}
