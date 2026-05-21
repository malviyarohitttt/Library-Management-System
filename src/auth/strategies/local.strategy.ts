/* eslint-disable prefer-const */
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Strategy } from 'passport-local';
import { ValidatedUser } from '@Common';
import { LOCAL_AUTH } from '../auth.constants';
import { LibrariansService } from 'src/librarians/librarians.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, LOCAL_AUTH) {
  constructor(private readonly librariansService: LibrariansService) {
    super({
      usernameField: 'email',
    });
  }

  async validate(email: string, password: string): Promise<ValidatedUser> {
    let librarian: false | ValidatedUser | null;

    librarian = await this.librariansService.validateCredentials(
      email,
      password,
    );

    if (librarian === null) {
      if (librarian === false)
        throw new UnauthorizedException('Incorrect password');
    }

    if (librarian) return librarian;

    throw new UnauthorizedException('Librarian does not exist');
  }
}
