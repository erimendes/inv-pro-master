import {
  IsEmail,
  IsString,
  MinLength,
  IsOptional,
  IsNotEmpty,
  IsEnum,
  IsBoolean,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Role, AuthProvider } from '../../../../generated/prisma/client';

export class CreateUserDto {
  @ApiProperty({ example: 'francisco' })
  @IsString()
  @IsNotEmpty()
  username!: string;

  @ApiProperty({ example: 'francisco@empresa.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({
    example: 'Admin@123',
    required: false,
    description: 'Obrigatória apenas para usuários LOCAL',
  })
  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;

  @ApiProperty({ example: 'Francisco Rabelo', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  // 🆕 CAMPO ADICIONADO: Departamento do usuário
  @ApiProperty({ example: 'TI', required: false })
  @IsOptional()
  @IsString()
  departamento?: string;

  @ApiProperty({ enum: Role, example: Role.USER })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @ApiProperty({ enum: AuthProvider, example: AuthProvider.AD })
  @IsOptional()
  @IsEnum(AuthProvider)
  authProvider?: AuthProvider;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  ativo?: boolean;
}