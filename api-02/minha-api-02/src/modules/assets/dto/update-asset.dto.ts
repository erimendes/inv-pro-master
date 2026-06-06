// src/modules/assets/dto/update-asset.dto.ts
import { CreateAssetDto } from './create-asset.dto';
import { PartialType } from '@nestjs/mapped-types';

export class UpdateAssetDto extends PartialType(
  CreateAssetDto,
) {}
