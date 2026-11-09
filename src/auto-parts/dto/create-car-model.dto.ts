import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateCarModelDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  brand!: string;

  @IsInt()
  @Min(1950)
  @Max(2100)
  yearFrom!: number;

  @IsOptional()
  @IsInt()
  @Min(1950)
  @Max(2100)
  yearTo?: number;
}
