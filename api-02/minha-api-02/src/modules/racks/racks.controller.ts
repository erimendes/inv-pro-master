import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';

import {
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { RacksService } from './racks.service';

import { CreateRackDto } from './dto/create-rack.dto';
import { UpdateRackDto } from './dto/update-rack.dto';

// 🛡️ IMPORTANTE: Importar o seu decorator de permissão
import { CheckPermission } from '../../common/decorators/roles.decorator'; // ⚠️ Ajuste o caminho se necessário

@ApiTags('Racks')
@Controller('racks')
export class RacksController {
  constructor(
    private readonly racksService: RacksService,
  ) {}

  @Post()
  @CheckPermission('racks', 'modify') // ✍️ Definição de escrita inserida aqui de forma limpa!
  @ApiOperation({
    summary: 'Criar rack',
  })
  create(
    @Body()
    createRackDto: CreateRackDto,
  ) {
    return this.racksService.create(
      createRackDto,
    );
  }

  @Get()
  @CheckPermission('racks', 'view') // 👁️ Definição de leitura inserida aqui de forma limpa!
  @ApiOperation({
    summary: 'Listar racks',
  })
  findAll() {
    return this.racksService.findAll();
  }

  @Get(':id')
  @CheckPermission('racks', 'view') // 👁️ Definição de leitura inserida aqui de forma limpa!
  @ApiOperation({
    summary: 'Buscar rack por ID',
  })
  findOne(
    @Param('id')
    id: string,
  ) {
    return this.racksService.findOne(id);
  }

  @Put(':id')
  @CheckPermission('racks', 'modify') // ✍️ Definição de escrita inserida aqui de forma limpa!
  @ApiOperation({
    summary: 'Atualizar rack',
  })
  update(
    @Param('id')
    id: string,

    @Body()
    body: UpdateRackDto,
  ) {
    return this.racksService.update(
      id,
      body,
    );
  }

  @Delete(':id')
  @CheckPermission('racks', 'modify') // ✍️ Definição de escrita inserida aqui de forma limpa!
  @ApiOperation({
    summary: 'Remover rack',
  })
  remove(
    @Param('id')
    id: string,
  ) {
    return this.racksService.remove(id);
  }
}