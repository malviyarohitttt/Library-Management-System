import { registerAs } from '@nestjs/config';

export const librarianConfigFactory = registerAs('librarian', () => ({
  passwordSaltLength: 16,
  passwordHashLength: 32,
  profileImagePath: 'librarian/profile',
}));
