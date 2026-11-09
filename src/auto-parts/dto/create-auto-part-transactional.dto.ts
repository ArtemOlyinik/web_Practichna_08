import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { CreateAutoPartDto } from './create-auto-part.dto.js';

export class CompatibilityCodeDto {
  @IsString()
  @Length(4, 60)
  code!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  manufacturer!: string;

  @IsOptional()
  @IsBoolean()
  isInterchangeable?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}

export class CreateAutoPartTransactionalDto extends CreateAutoPartDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => CompatibilityCodeDto)
  compatibilityCode?: CompatibilityCodeDto;

  /**
   * Імітація збою бізнес-логіки після збереження частини даних.
   * Використовується для демонстрації відкату транзакції.
   */
  @IsOptional()
  @IsBoolean()
  simulateFailure?: boolean;
}
