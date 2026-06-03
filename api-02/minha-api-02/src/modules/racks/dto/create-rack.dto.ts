// src/modules/racks/dto/create-rack.dto.ts
import {
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

import {
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';

export class CreateRackDto {
  @ApiProperty({
    example: 'Rack CPD 01',
  })
  @IsString()
  nome!: string;

  @ApiPropertyOptional({
    example: 'Sala do Datacenter',
  })
  @IsOptional()
  @IsString()
  localizacao?: string;

  @ApiPropertyOptional({
    example: 42,
    default: 42,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  capacidade?: number;
}
