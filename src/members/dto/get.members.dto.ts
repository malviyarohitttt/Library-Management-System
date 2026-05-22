import { IsString, IsOptional, Min, Max, IsNumber } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class GetMembersDto {
  @ApiPropertyOptional({
    description: 'Search by name, email, phone, or membershipId',
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsNumber()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ default: 10 })
  @IsNumber()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number = 10;
}
