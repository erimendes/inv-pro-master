// src/modules/users/user.controller.ts
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { Request } from 'express';

import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../../generated/prisma/client';

// Interface para tipar o Request que passou pelo JwtAuthGuard
interface AuthenticatedRequest extends Request {
  user: {
    sub: string;
    username: string;
    email: string;
    role: Role;
    sessionId: string;
  };
}

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UserController {
  constructor(private readonly service: UserService) {}

  // -----------------------------------------------------------------
  // ME (Rotas estáticas SEMPRE no topo para evitar conflito com :id)
  // -----------------------------------------------------------------
  @Patch('me')
  @ApiOperation({ summary: 'Atualizar meu próprio perfil' })
  updateMe(
    @Req() req: AuthenticatedRequest,
    @Body() body: UpdateUserDto,
  ) {
    const userId = req.user.sub;
    return this.service.update(userId, body);
  }

  // -----------------------------------------------------------------
  // ADMIN OPERATIONS (Guards de rotas específicas)
  // -----------------------------------------------------------------
  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Provisionar novo usuário (Admin)' })
  @ApiResponse({ status: 201, description: 'Usuário criado com sucesso' })
  create(@Body() body: CreateUserDto) {
    return this.service.create(body);
  }

  @Get()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Listar todos os usuários' })
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Buscar usuário por ID' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Atualizar usuário por ID' })
  update(
    @Param('id') id: string,
    @Body() body: UpdateUserDto,
  ) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Deletar usuário' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}