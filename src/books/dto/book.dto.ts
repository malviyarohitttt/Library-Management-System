import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  Min,
  Max,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';

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

  @ApiPropertyOptional({ example: 'A-01' })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  rackNumber?: string;

  @ApiProperty({ example: 3, minimum: 1 })
  @IsInt()
  @Min(1)
  totalCopies!: number;
}

export class UpdateBookDto extends PartialType(CreateBookDto) {}

export class QueryBooksDto {
  @ApiPropertyOptional({ description: 'Search by title or author' })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by author' })
  @IsString()
  @IsOptional()
  author?: string;

  @ApiPropertyOptional({ description: 'Filter by genre' })
  @IsString()
  @IsOptional()
  genre?: string;

  @ApiPropertyOptional({
    description: 'Filter available books only',
    type: Boolean,
  })
  @IsOptional()
  available?: string;

  @ApiPropertyOptional({
    description: 'Sort by field',
    enum: ['title', 'author', 'genre', 'createdAt', 'availableCopies'],
  })
  @IsOptional()
  sortBy?: string;

  @ApiPropertyOptional({ enum: ['asc', 'desc'], default: 'asc' })
  @IsOptional()
  sortOrder?: 'asc' | 'desc';

  @ApiPropertyOptional({ default: 1 })
  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({ default: 10 })
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  @Type(() => Number)
  limit?: number = 10;
}
