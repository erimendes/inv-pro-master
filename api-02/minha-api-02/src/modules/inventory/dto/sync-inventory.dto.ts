import { Type } from 'class-transformer';
import {
  ValidateNested,
  IsArray,
  ArrayMinSize,
} from 'class-validator';
import { CreateInventoryDto } from './create-inventory.dto';

export class SyncInventoryDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateInventoryDto)
  items!: CreateInventoryDto[];
}
