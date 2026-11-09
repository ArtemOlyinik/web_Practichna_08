import { Type } from 'class-transformer';
import { IsBoolean, IsOptional, ValidateNested } from 'class-validator';
import { CompatibilityCodeDto } from './create-auto-part-transactional.dto.js';
import { UpdateAutoPartDto } from './update-auto-part.dto.js';

export class UpdateAutoPartTransactionalDto extends UpdateAutoPartDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => CompatibilityCodeDto)
  compatibilityCode?: CompatibilityCodeDto;

  @IsOptional()
  @IsBoolean()
  simulateFailure?: boolean;
}
