import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  Min,
  Max,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBookDto {
  @ApiProperty({ example: 'Clean Code' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title!: string;

  @ApiProperty({ example: 'Robert C. Martin' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  author!: string;

  @ApiProperty({ example: '978-0-13-468599-1' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  isbn!: string;

  @ApiPropertyOptional({ example: 'Technology' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  genre?: string;

  @ApiPropertyOptional({
    example: 'A handbook of agile software craftsmanship',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 2008 })
  @IsInt()
  @Min(1000)
  @Max(new Date().getFullYear())
  @IsOptional()
  publishedYear?: number;

  @ApiProperty({ example: 3, minimum: 1 })
  @IsInt()
  @Min(1)
  totalCopies!: number;
}
