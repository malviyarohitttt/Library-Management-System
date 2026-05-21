import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginRequestDto {
  @ApiProperty({ example: 'librarian@gmail.com' })
  @IsEmail()
  readonly email!: string;

  @ApiProperty({ example: 'Admin123!@#' })
  @IsString()
  @IsNotEmpty()
  readonly password!: string;
}
