import {
  IsString,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsDateString,
  IsInt,
  Length,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { AtivoTipo, AtivoStatus } from '../../../../generated/prisma/client';

export class CreateInventoryDto {
  @Transform(({ value }) => value?.trim())
  @IsString()
  @Length(3, 50)
  tagPatrimonial!: string;

  @IsOptional()
  @IsEnum(AtivoTipo)
  tipo?: AtivoTipo;

  @Transform(({ value }) => value?.trim())
  @IsString()
  fabricante!: string;

  @Transform(({ value }) => value?.trim())
  @IsString()
  modelo!: string;

  @Transform(({ value }) => value?.trim())
  @IsString()
  numSerie!: string;

  @IsOptional()
  @Transform(({ value }) => value?.trim())
  @IsString()
  hostname?: string;

  @IsOptional()
  @IsString()
  cpu?: string;

  @IsOptional()
  @IsString()
  ram?: string;

  @IsOptional()
  @IsString()
  discoFisico?: string;

  @IsOptional()
  @IsEnum(AtivoStatus)
  status?: AtivoStatus;

  @IsOptional()
  @IsBoolean()
  emUso?: boolean;

  @IsOptional()
  @IsDateString()
  dataCompra?: string;

  @IsOptional()
  @Type(() => Number)
  valor?: number; // Prisma Decimal → number no DTO

  // Virtualização
  @IsOptional()
  @IsBoolean()
  isVirtualizado?: boolean;

  @IsOptional()
  @IsString()
  hyperVName?: string;

  @IsOptional()
  @IsInt()
  hostFisicoId?: number;

  // Relacionamento com User
  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsString()
  observacoes?: string;
}
