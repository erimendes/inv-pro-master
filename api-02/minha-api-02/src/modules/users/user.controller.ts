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

import { UserService } from './user.service';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

import { Roles } from '../../common/decorators/roles.decorator';

import { Role } from '../../../generated/prisma/client';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('users')
export class UserController {
  constructor(
    private readonly service: UserService,
  ) {}

  // =========================================
  // CREATE
  // =========================================
  @Post()
  @ApiOperation({
    summary:
      'Provisionar novo usuário (Admin)',
  })
  @ApiResponse({
    status: 201,
    description:
      'Usuário criado com sucesso',
  })
  create(
    @Body() body: CreateUserDto,
  ) {
    return this.service.create(body);
  }

  // =========================================
  // LIST
  // =========================================
  @Get()
  @ApiOperation({
    summary:
      'Listar todos os usuários',
  })
  findAll() {
    return this.service.findAll();
  }

  // =========================================
  // DETAILS
  // =========================================
  @Get(':id')
  @ApiOperation({
    summary:
      'Buscar usuário por ID',
  })
  findOne(
    @Param('id') id: string,
  ) {
    return this.service.findOne(id);
  }

  // =========================================
  // UPDATE USER
  // =========================================
  @Patch(':id')
  @ApiOperation({
    summary:
      'Atualizar usuário por ID',
  })
  update(
    @Param('id') id: string,
    @Body() body: UpdateUserDto,
  ) {
    return this.service.update(
      id,
      body,
    );
  }

  // =========================================
  // UPDATE ME
  // =========================================
  @Patch('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary:
      'Atualizar meu próprio perfil',
  })
  updateMe(
    @Req() req: any,
    @Body() body: UpdateUserDto,
  ) {
    const userId =
      req.user.sub ||
      req.user.userId;

    return this.service.update(
      userId,
      body,
    );
  }

  // =========================================
  // DELETE
  // =========================================
  @Delete(':id')
  @ApiOperation({
    summary:
      'Deletar usuário',
  })
  remove(
    @Param('id') id: string,
  ) {
    return this.service.remove(id);
  }
}
