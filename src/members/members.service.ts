import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMemberDto, UpdateMemberDto, GetMembersDto } from './dto';
import { MembershipStatus } from 'src/generated/prisma/enums';
import { getPaginationParams } from 'src/common/utils/pagination.utils';
import { generateMembershipId } from 'src/common/utils/fine.utils';

@Injectable()
export class MembersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateMemberDto) {
    if (dto.phone) {
      const existing = await this.prisma.member.findUnique({
        where: { phone: dto.phone },
      });
      if (existing) {
        throw new Error('A member with this phone number already exists');
      }
    }
    if (dto.email) {
      const existing = await this.prisma.member.findUnique({
        where: { email: dto.email },
      });
      if (existing) {
        throw new Error('A member with this email already exists');
      }
    }

    const lastMember = await this.prisma.member.findFirst({
      orderBy: { id: 'desc' },
      select: { id: true },
    });

    const membershipId = generateMembershipId(lastMember?.id ?? 0);

    const member = await this.prisma.member.create({
      data: {
        ...dto,
        membershipId,
      },
    });

    return {
      status: 'success',
      message: 'Member registered successfully',
      data: member,
    };
  }

  async findAll(query: GetMembersDto) {
    const { search, page = 1, limit = 10 } = query;
    const { skip, take } = getPaginationParams(page, limit);

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
        { membershipId: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [members, total] = await Promise.all([
      this.prisma.member.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              rentals: true,
            },
          },
        },
      }),
      this.prisma.member.count({ where }),
    ]);

    return {
      status: 'success',
      message: 'Members retrieved successfully',
      data: members,
      total,
    };
  }

  async findOne(id: number) {
    const member = await this.prisma.member.findUnique({
      where: { id },
      include: {
        rentals: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: {
            book: {
              select: { title: true, author: true, isbn: true },
            },
          },
        },
        _count: {
          select: { rentals: true },
        },
      },
    });

    if (!member) {
      throw new Error(`Member #${id} not found`);
    }

    return {
      status: 'success',
      message: 'Member retrieved successfully',
      data: member,
    };
  }

  async findByMembershipId(membershipId: string) {
    const member = await this.prisma.member.findUnique({
      where: { membershipId },
      include: {
        _count: {
          select: { rentals: true },
        },
      },
    });

    if (!member) {
      throw new Error(`Member with ID ${membershipId} not found`);
    }
    return member;
  }

  async update(id: number, dto: UpdateMemberDto) {
    await this.findOneOrFail(id);

     if (dto.phone) {
      const existing = await this.prisma.member.findFirst({
        where: { phone: dto.phone, NOT: { id } },
      });
      if (existing) {
        throw new Error('A member with this phone number already exists');
      }
    }

     if (dto.email) {
      const existing = await this.prisma.member.findFirst({
        where: { email: dto.email, NOT: { id } },
      });
      if (existing) {
        throw new Error('A member with this email already exists');
      }
    }

    const member = await this.prisma.member.update({
      where: { id },
      data: dto,
    });

    return {
      status: 'success',
      message: 'Member updated successfully',
      data: member,
    };
  }

  async block(id: number) {
    await this.findOneOrFail(id);

    const member = await this.prisma.member.update({
      where: { id },
      data: { membershipStatus: MembershipStatus.Blocked },
    });

    return {
      status: 'success',
      message: 'Member blocked successfully',
      data: member,
    };
  }

  async remove(id: number) {
    await this.findOneOrFail(id);

     const activeRentals = await this.prisma.rental.count({
      where: {
        memberId: id,
        status: 'Issued',
      },
    });

    if (activeRentals > 0) {
      throw new Error(
        `Cannot delete member with ${activeRentals} active rental(s). Please return all books first.`,
      );
    }

    await this.prisma.member.delete({ where: { id } });

    return {
      status: 'success',
      message: 'Member deleted successfully',
      data: null,
    };
  }

  private async findOneOrFail(id: number) {
    const member = await this.prisma.member.findUnique({ where: { id } });
    if (!member) {
      throw new Error(`Member #${id} not found`);
    }
    return member;
  }
}
