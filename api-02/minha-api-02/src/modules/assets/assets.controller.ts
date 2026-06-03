// src/modules/assets/assets.controller.ts

import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  Delete,
  BadRequestException,
  Put,
} from '@nestjs/common';

import {
  ApiBody,
  ApiOperation,
  ApiTags,
  ApiPropertyOptional,
} from '@nestjs/swagger';

import { IsOptional, IsString, IsInt, Min } from 'class-validator';

import { AssetsService } from './assets.service';

import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';

class UpdateAssetPositionDto {
  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  rackId?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  posicaoRack?: number | null;
}

@ApiTags('Assets')
@Controller('assets')
export class AssetsController {
  constructor(
    private readonly assetsService: AssetsService,
  ) {}

  @Get()
  findAll(
    @Query('tipo') tipo?: string,
  ) {
    return this.assetsService.findAll(
      tipo,
    );
  }

  @Get('available')
  findAvailable() {
    return this.assetsService.findAvailable();
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
  ) {
    return this.assetsService.findOne(
      Number(id),
    );
  }

  @Post()
  create(
    @Body()
    createAssetDto: CreateAssetDto,
  ) {
    return this.assetsService.create(
      createAssetDto,
    );
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Atualizar Ativo',
  })
  @ApiBody({
    type: UpdateAssetDto,
  })
  update(
    @Param('id') id: string,

    @Body()
    body: UpdateAssetDto,
  ) {
    return this.assetsService.update(
      Number(id),
      body,
    );
  }

  @Patch(':id')
  partialUpdate(
    @Param('id') id: string,

    @Body()
    updateAssetDto: UpdateAssetDto,
  ) {
    return this.assetsService.update(
      Number(id),
      updateAssetDto,
    );
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
  ) {
    return this.assetsService.remove(
      Number(id),
    );
  }

  @Patch(':id/position')
  @ApiOperation({
    summary: 'Atualizar Posicao do Ativo no Rack',
  })
  updatePosition(
    @Param('id') id: string,

    @Body()
    updateDto: UpdateAssetPositionDto,
  ) {
    if (!id) {
      throw new BadRequestException(
        'O ID do ativo e obrigatorio na URL',
      );
    }

    return this.assetsService.updatePosition(
      Number(id),
      {
        rackId: updateDto.rackId ?? null,
        posicaoRack: updateDto.posicaoRack ?? null,
      },
    );
  }
}
