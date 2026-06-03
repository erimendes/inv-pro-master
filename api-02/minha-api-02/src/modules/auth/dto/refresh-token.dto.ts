import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({ 
    example: 'eyJhbGciOiJIUzI1Ni...', 
    description: 'O refresh token recebido no login' 
  })
  @IsNotEmpty()
  @IsString()
  refreshToken: string;
}
