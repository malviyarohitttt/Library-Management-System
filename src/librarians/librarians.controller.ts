import { Body, Controller, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  AccessGuard,
  AuthenticatedRequest,
  BaseController,
  JwtAuthGuard,
  Roles,
  RolesGuard,
  UserType,
} from '@Common';
import {
  AuthenticateRequestDto,
  ChangePasswordRequestDto,
  UpdateProfileDetailsRequestDto,
} from './dto';
import { LibrariansService } from './librarians.service';

@ApiTags('Librarian')
@ApiBearerAuth()
@Roles(UserType.Librarian)
@UseGuards(JwtAuthGuard, AccessGuard, RolesGuard)
@Controller('librarian')
export class LibrariansController extends BaseController {
  constructor(private readonly librariansService: LibrariansService) {
    super();
  }

  @Patch('update')
  async updateProfileDetails(
    @Req() req: AuthenticatedRequest,
    @Body() data: UpdateProfileDetailsRequestDto,
  ) {
    const ctx = this.getContext(req);
    await this.librariansService.updateProfileDetails(ctx.user.id, {
      name: data.name,
      email: data.email,
    });
    return { status: 'success' };
  }

  @Post('change-password')
  async changePassword(
    @Req() req: AuthenticatedRequest,
    @Body() data: ChangePasswordRequestDto,
  ) {
    const ctx = this.getContext(req);
    await this.librariansService.changePassword(
      ctx.user.id,
      data.oldPassword,
      data.newPassword,
    );
    return { status: 'success' };
  }

  @Post('authenticate')
  async authenticate(
    @Req() req: AuthenticatedRequest,
    @Body() data: AuthenticateRequestDto,
  ) {
    const ctx = this.getContext(req);
    await this.librariansService.authenticate(ctx.user.id, data.password);
    return { status: 'success' };
  }
}
