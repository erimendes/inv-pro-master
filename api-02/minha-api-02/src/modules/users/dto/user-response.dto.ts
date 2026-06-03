import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'usuario@exemplo.com' })
  email: string;

  @ApiProperty({ example: 'João Silva', nullable: true })
  name: string | null;

  @ApiProperty({ example: 'USER' })
  role: string;

  @ApiProperty()
  createdAt: Date;
}
