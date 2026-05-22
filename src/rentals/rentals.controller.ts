import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { RentalsService } from './rentals.service';
import { IssueBookDto, GetRentalsDto } from './dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AuthenticatedRequest, Roles, RolesGuard, UserType } from '@Common';

@ApiTags('Rentals')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserType.Librarian)
@Controller('rentals')
export class RentalsController {
  constructor(private readonly rentalsService: RentalsService) {}

  @Post('issue')
  issueBook(@Body() dto: IssueBookDto, @Req() req: AuthenticatedRequest) {
    const ctx = req.user.id;
    return this.rentalsService.issueBook(dto, ctx);
  }

  @Patch('return/:rentalId')
  @ApiParam({ name: 'rentalId', type: Number })
  returnBook(@Param('rentalId', ParseIntPipe) rentalId: number) {
    return this.rentalsService.returnBook(rentalId);
  }

  @Get()
  findAll(@Query() query: GetRentalsDto) {
    return this.rentalsService.findAll(query);
  }

  @Get('overdue')
  findOverdue() {
    return this.rentalsService.findOverdue();
  }

  @Get('member/:memberId')
  @ApiParam({ name: 'memberId', type: Number })
  findByMember(
    @Param('memberId', ParseIntPipe) memberId: number,
    @Query() query: GetRentalsDto,
  ) {
    return this.rentalsService.findByMember(memberId, query);
  }
}
