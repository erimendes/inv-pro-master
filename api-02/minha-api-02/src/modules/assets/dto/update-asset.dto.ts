// src/modules/assets/dto/update-asset.dto.ts
import { CreateAssetDto } from './create-asset.dto';
import { PartialType } from '@nestjs/mapped-types';

// Com o PartialType, todas as regras (incluindo o vmsIds) são herdadas como opcionais
export class UpdateAssetDto extends PartialType(CreateAssetDto) {}