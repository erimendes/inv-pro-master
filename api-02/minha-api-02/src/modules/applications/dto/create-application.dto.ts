import {
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';

import {
  Criticidade,
  SistemaCategoria,
} from '../../../generated/prisma/client';

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateApplicationDto {
  @ApiProperty()
  @IsString()
  nome!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sigla?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  descricao?: string;

  @ApiProperty({
    enum: SistemaCategoria,
    example: SistemaCategoria.OPERACIONAL,
  })
  @IsEnum(SistemaCategoria)
  categoria?: SistemaCategoria;

  @ApiProperty({
    enum: Criticidade,
    example: Criticidade.ALTA,
  })
  @IsEnum(Criticidade)
  criticidade?: Criticidade;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  businessOwner?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  responsavelTecnico?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  contatoFuncional?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  fornecedor?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  janelaOperacao?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  backupInfo?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  procedimentoRecup?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  pontoUnicoFalha?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  tecnologiaPrincipal?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  databaseInfo?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  integracoes?: string;

  @ApiPropertyOptional({
    type: [Number],
    description: 'IDs dos servidores vinculados',
  })
  @IsOptional()
  servidoresIds?: number[];
}