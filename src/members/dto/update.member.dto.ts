import { IsEnum, IsOptional } from 'class-validator';
import { CreateMemberDto } from './create.member.dto';
import { MembershipStatus } from 'src/generated/prisma/enums';
import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';

export class UpdateMemberDto extends PartialType(CreateMemberDto) {
  @ApiPropertyOptional({ enum: MembershipStatus })
  @IsEnum(MembershipStatus)
  @IsOptional()
  membershipStatus?: MembershipStatus;
}
