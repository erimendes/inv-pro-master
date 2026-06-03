// src/modules/assets/dto/create-asset.dto.ts

import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

import {
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';

import {
  AtivoTipo,
  AtivoStatus,
  PowerState,
  Criticidade,
  HypervisorTipo,
} from '../../../../generated/prisma/client';

export class CreateAssetDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  patrimonio?: string;

  @ApiProperty({
    enum: AtivoTipo,
    example: AtivoTipo.SERVIDOR_FISICO,
  })
  @IsEnum(AtivoTipo)
  tipo!: AtivoTipo;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  fabricante?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  hardware?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  modelo?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  serial?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  hostname?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  apelido?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  descricao?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  tag?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  ipPrincipal?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sistemaOperacional?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  versaoSO?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  cpu?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  nucleosCPU?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  threadsCPU?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  ram?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  armazenamento?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  gpu?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  macAddress?: string;

  @ApiPropertyOptional({
    enum: AtivoStatus,
  })
  @IsOptional()
  @IsEnum(AtivoStatus)
  status?: AtivoStatus;

  @ApiPropertyOptional({
    enum: PowerState,
  })
  @IsOptional()
  @IsEnum(PowerState)
  powerState?: PowerState;

  @ApiPropertyOptional({
    enum: Criticidade,
  })
  @IsOptional()
  @IsEnum(Criticidade)
  criticidade?: Criticidade;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  emUso?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  monitorado?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dataCompra?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  garantiaFim?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  valor?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  fornecedor?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  observacoes?: string;

  //////////////////////////////////////////////////////
  // Virtualização
  //////////////////////////////////////////////////////

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isVirtualizado?: boolean;

  @ApiPropertyOptional({
    enum: HypervisorTipo,
  })
  @IsOptional()
  @IsEnum(HypervisorTipo)
  hypervisor?: HypervisorTipo;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  vmId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  cluster?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  datacenter?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  hostFisicoId?: number;

  //////////////////////////////////////////////////////
  // Relacionamentos
  //////////////////////////////////////////////////////

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  rackId?: string;

  //////////////////////////////////////////////////////
  // Rack
  //////////////////////////////////////////////////////

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  posicaoRack?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  tamanhoU?: number;

  //////////////////////////////////////////////////////
  // GLPI
  //////////////////////////////////////////////////////

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  glpiId?: number;
}