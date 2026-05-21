import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { jwtConfigFactory } from '@Config';
import { AuthenticatedUser, JwtPayload } from '../types';
import { JWT_AUTH } from '../common.constants';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, JWT_AUTH) {
  constructor(
    @Inject(jwtConfigFactory.KEY)
    config: ConfigType<typeof jwtConfigFactory>,
  ) {
    super({
      jwtFromRequest: (req) => {
        const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
        return token;
      },
      ignoreExpiration: false,
      secretOrKey: config.secret as string,
    });
  }

  async validate(
    payload: JwtPayload & { readonly iat: number; readonly exp: number },
  ): Promise<AuthenticatedUser> {
    return {
      id: payload.sub,
      type: payload.type,
    };
  }
}
