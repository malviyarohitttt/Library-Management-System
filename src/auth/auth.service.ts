import { Injectable } from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { JwtPayload, UserType } from '@Common';
import { OtpService, VerifyCodeResponse } from '../otp';

export type ValidAuthResponse = {
  accessToken: string;
  expiresIn: number;
  type: UserType;
};

export type InvalidVerifyCodeResponse = {
  email: VerifyCodeResponse;
  mobile?: VerifyCodeResponse;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly otpService: OtpService,
  ) {}

  private async generateJwt(
    payload: JwtPayload,
    options?: JwtSignOptions,
  ): Promise<{ token: string; expiresIn: number }> {
    const token = await this.jwtService.signAsync(payload, options);
    const { iat, exp } = this.jwtService.decode(token);

    return { token, expiresIn: exp - iat };
  }

  async login(userId: number, type: UserType): Promise<ValidAuthResponse> {
    const { token, expiresIn } = await this.generateJwt({
      sub: userId,
      type,
    });
    return {
      accessToken: token,
      expiresIn,
      type,
    };
  }
}
