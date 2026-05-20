import {
  IsString,
  IsInt,
  IsBoolean,
  Min,
  Max,
  IsOptional,
} from 'class-validator';

export class CreateBookDto {
  @IsString()
  title!: string;

  @IsString()
  author!: string;

  @IsInt()
  @Min(1000)
  @Max(new Date().getFullYear())
  publishedYear!: number;

  @IsOptional()
  @IsBoolean()
  available?: boolean;

  @IsInt()
  @Min(1)
  totalCopies!: number;

  @IsInt()
  @Min(0)
  availableCopies!: number;
}
