import {
  ArrayMaxSize,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  Length,
  MaxLength,
} from 'class-validator';
import { PartCondition } from '../entities/auto-part.entity.js';

export class CreateAutoPartDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  title!: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  price!: number;

  @IsString()
  @Length(6, 20)
  oemCode!: string;

  @IsEnum(PartCondition)
  condition!: PartCondition;

  @IsUUID()
  carModelId!: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @IsString({ each: true })
  @MaxLength(100, { each: true })
  specificationNames?: string[];
}
