import { IsNumber, Min, Max, IsOptional, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { RentalStatus } from 'src/generated/prisma/enums';

export class GetRentalsDto {
  @ApiPropertyOptional({ enum: RentalStatus })
  @IsEnum(RentalStatus)
  @IsOptional()
  status?: RentalStatus;

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
