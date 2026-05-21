import { Cache } from 'cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { librarianConfigFactory } from '@Config';
import {
  UtilsService,
  ValidatedUser,
  UserType,
  getAccessGuardCacheKey,
} from '@Common';
import { PrismaService } from '../prisma';
import {
  Librarian,
  LibrarianMeta,
  LibrarianStatus,
  Prisma,
} from 'src/generated/prisma/client';

@Injectable()
export class LibrariansService {
  constructor(
    @Inject(librarianConfigFactory.KEY)
    private readonly config: ConfigType<typeof librarianConfigFactory>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly prisma: PrismaService,
    private readonly utilsService: UtilsService,
  ) {}

  private hashPassword(password: string): { salt: string; hash: string } {
    const salt = this.utilsService.generateSalt(this.config.passwordSaltLength);
    const hash = this.utilsService.hashPassword(
      password,
      salt,
      this.config.passwordHashLength,
    );
    return { salt, hash };
  }

  async isEmailExist(
    email: string,
    excludeLibrarianId?: number,
  ): Promise<boolean> {
    return (
      (await this.prisma.librarian.count({
        where: {
          email: email.toLowerCase(),
          NOT: {
            id: excludeLibrarianId,
          },
        },
      })) !== 0
    );
  }

  async getById(librarianId: number): Promise<Librarian> {
    return await this.prisma.librarian.findUniqueOrThrow({
      where: {
        id: librarianId,
      },
    });
  }

  async getByEmail(email: string): Promise<Librarian | null> {
    return await this.prisma.librarian.findUnique({
      where: {
        email: email.toLowerCase(),
      },
    });
  }

  async getMetaById(librarianId: number): Promise<LibrarianMeta> {
    return await this.prisma.librarianMeta.findUniqueOrThrow({
      where: {
        librarianId,
      },
    });
  }

  async authenticate(
    librarianId: number,
    password: string,
  ): Promise<Librarian> {
    const librarian = await this.getById(librarianId);

    const validation = await this.validateCredentials(
      librarian.email,
      password,
    );

    if (!validation === null) throw new Error('Librarian not found');
    if (validation === false) throw new Error('Incorrect password');

    return librarian;
  }

  async validateCredentials(
    email: string,
    password: string,
  ): Promise<ValidatedUser | false | null> {
    const librarian = await this.getByEmail(email);
    if (!librarian) return null;
    if (librarian.status !== LibrarianStatus.Active) {
      throw new Error(
        'Your account has been temporarily suspended/blocked by the system',
      );
    }

    const librarianMeta = await this.getMetaById(librarian.id);
    const passwordHash = this.utilsService.hashPassword(
      password,
      librarianMeta.passwordSalt || '',
      librarianMeta.passwordHash
        ? librarianMeta.passwordHash.length / 2
        : this.config.passwordHashLength,
    );

    if (librarianMeta.passwordHash === passwordHash) {
      return {
        id: librarian.id,
        type: UserType.Librarian,
      };
    }

    return false;
  }

  async updateProfileDetails(
    librarianId: number,
    data: {
      name?: string;
      email?: string;
    },
    options?: { tx?: Prisma.TransactionClient },
  ): Promise<Librarian> {
    const prismaClient = options?.tx ? options.tx : this.prisma;

    const librarian = await prismaClient.librarian.findUniqueOrThrow({
      where: { id: librarianId },
    });
    if (data.email && (await this.isEmailExist(data.email, librarianId))) {
      throw new Error('Email already exist');
    }

    return await prismaClient.librarian.update({
      data: {
        name: data.name,
        email: data.email && data.email.toLowerCase(),
      },
      where: {
        id: librarian.id,
      },
    });
  }

  async changePassword(
    librarianId: number,
    oldPassword: string,
    newPassword: string,
  ): Promise<Librarian> {
    const librarian = await this.getById(librarianId);
    const librarianMeta = await this.getMetaById(librarian.id);

    const hashedPassword = this.utilsService.hashPassword(
      oldPassword,
      librarianMeta.passwordSalt || '',
      librarianMeta.passwordHash
        ? librarianMeta.passwordHash.length / 2
        : this.config.passwordHashLength,
    );

    if (hashedPassword !== librarianMeta.passwordHash)
      throw new Error('Password does not match');

    const { salt, hash } = this.hashPassword(newPassword);
    const passwordSalt = salt;
    const passwordHash = hash;

    await this.prisma.librarianMeta.update({
      data: {
        passwordHash,
        passwordSalt,
      },
      where: {
        librarianId,
      },
    });
    return librarian;
  }

  async setStatus(userId: number, status: LibrarianStatus): Promise<Librarian> {
    await this.cacheManager.del(
      getAccessGuardCacheKey({ id: userId, type: UserType.Librarian }),
    );
    return await this.prisma.librarian.update({
      data: { status },
      where: {
        id: userId,
      },
    });
  }
}
