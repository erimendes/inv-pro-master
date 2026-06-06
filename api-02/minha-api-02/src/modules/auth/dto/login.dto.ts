// src/modules/auth/dto/login.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsEmail } from 'class-validator';

export class LoginDto {
  @ApiProperty({ 
    description: 'Username do usuário (obrigatório se o e-mail não for enviado)', 
    example: 'johndoe' 
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  username?: string;

  @ApiProperty({ 
    description: 'E-mail do usuário (obrigatório se o username não for enviado)', 
    example: 'john@empresa.com' 
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ description: 'Senha do usuário', example: 'Senha@123' })
  @IsString()
  @IsNotEmpty()
  password!: string;
}