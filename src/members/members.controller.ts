import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { MembersService } from './members.service';
import { CreateMemberDto, UpdateMemberDto, GetMembersDto } from './dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('Members')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('members')
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  @Post()
  create(@Body() dto: CreateMemberDto) {
    return this.membersService.create(dto);
  }

  @Get()
  findAll(@Query() query: GetMembersDto) {
    return this.membersService.findAll(query);
  }

  @Get(':id')
  @ApiParam({ name: 'id', type: Number })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.membersService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateMemberDto) {
    return this.membersService.update(id, dto);
  }

  @Patch(':id/block')
  block(@Param('id', ParseIntPipe) id: number) {
    return this.membersService.setStatus(id);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.membersService.remove(id);
  }
  @Patch(':id/history')
  history(@Param('id', ParseIntPipe) id: number) {
    return this.membersService.history(id);
  }
}
