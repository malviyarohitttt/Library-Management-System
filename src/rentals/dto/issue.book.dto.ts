import { IsString, IsNumber, IsNotEmpty, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class IssueBookDto {
  @ApiProperty({
    example: 'MEM-1001',
  })
  @IsString()
  @IsNotEmpty()
  membershipId!: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @Min(1)
  bookId!: number;

  @ApiProperty({
    example: 7,
    minimum: 1,
    maximum: 30,
  })
  @IsNumber()
  @Min(1)
  @Max(30)
  dueDays!: number;
}
