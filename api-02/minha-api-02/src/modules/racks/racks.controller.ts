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

@ApiTags('Racks')
@Controller('racks')
export class RacksController {
  constructor(
    private readonly racksService: RacksService,
  ) {}

  @Post()
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
  @ApiOperation({
    summary: 'Listar racks',
  })
  findAll() {
    return this.racksService.findAll();
  }

  @Get(':id')
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
