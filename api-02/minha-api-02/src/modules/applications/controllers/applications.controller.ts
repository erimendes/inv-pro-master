import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';

import {
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';

import {
  Criticidade,
  SistemaCategoria,
} from '../../../generated/prisma/client';

import { ApplicationsService } from '../services/applications.service';

import { CreateApplicationDto } from '../dto/create-application.dto';
import { UpdateApplicationDto } from '../dto/update-application.dto';

@ApiTags('Applications')
@Controller('aplicacoes')
export class ApplicationsController {
  constructor(
    private readonly appsService: ApplicationsService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Criar aplicação',
  })
  create(
    @Body() body: CreateApplicationDto,
  ) {
    return this.appsService.create(body);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar aplicações',
  })

  @ApiQuery({
    name: 'categoria',
    required: false,
    enum: SistemaCategoria,
  })

  @ApiQuery({
    name: 'criticidade',
    required: false,
    enum: Criticidade,
  })

  findAll(
    @Query('categoria')
    categoria?: SistemaCategoria,

    @Query('criticidade')
    criticidade?: Criticidade,
  ) {
    return this.appsService.findAll(
      categoria,
      criticidade,
    );
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Buscar aplicação por ID',
  })

  findOne(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.appsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Atualizar aplicação',
  })

  update(
    @Param('id', ParseIntPipe)
    id: number,

    @Body()
    body: UpdateApplicationDto,
  ) {
    return this.appsService.update(id, body);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Remover aplicação',
  })

  remove(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.appsService.remove(id);
  }
}