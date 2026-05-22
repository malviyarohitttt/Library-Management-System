import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { calculateDueDate } from '../common/utils/fine.utils';
import { getPaginationParams } from '../common/utils/pagination.utils';
import { IssueBookDto, GetRentalsDto } from './dto';
import { RentalStatus } from 'src/generated/prisma/enums';

const MAX_ACTIVE_RENTALS = 3;

@Injectable()
export class RentalsService {
  private readonly logger = new Logger(RentalsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async issueBook(dto: IssueBookDto, librarianId: number) {
    const { membershipId, bookId, dueDays } = dto;

    const rental = await this.prisma.$transaction(async (tx) => {
      const member = await tx.member.findUnique({
        where: { membershipId },
      });

      if (!member) {
        throw new Error(`Member with ID ${membershipId} not found`);
      }

      if (member.membershipStatus === 'Blocked') {
        throw new Error(
          `Member ${member.name} (${membershipId}) is blocked and cannot rent books`,
        );
      }

      const book = await tx.book.findUnique({
        where: { id: bookId },
      });

      if (!book) {
        throw new Error(`Book #${bookId} not found`);
      }

      if (book.availableCopies <= 0) {
        throw new Error(
          `"${book.title}" is currently unavailable. All copies are rented out.`,
        );
      }

      const existingRental = await tx.rental.findFirst({
        where: {
          memberId: member.id,
          bookId,
          status: 'Issued',
        },
      });

      if (existingRental) {
        throw new Error(
          `Member ${member.name} already has an active rental for "${book.title}"`,
        );
      }

      const activeRentalsCount = await tx.rental.count({
        where: {
          memberId: member.id,
          status: 'Issued',
        },
      });

      if (activeRentalsCount >= MAX_ACTIVE_RENTALS) {
        throw new Error(
          `Member ${member.name} has reached the maximum limit of ${MAX_ACTIVE_RENTALS} active rentals`,
        );
      }

      const issueDate = new Date();
      const dueDate = calculateDueDate(issueDate, dueDays);

      const newRental = await tx.rental.create({
        data: {
          memberId: member.id,
          bookId,
          issuedById: librarianId,
          issueDate,
          dueDate,
          status: RentalStatus.Issued,
        },
        include: {
          member: { select: { name: true, membershipId: true } },
          book: { select: { title: true, author: true, isbn: true } },
          issuedBy: { select: { name: true } },
        },
      });

      await tx.book.update({
        where: { id: bookId },
        data: { availableCopies: { decrement: 1 } },
      });

      this.logger.log(
        `Book issued: "${book.title}" → ${member.name} (${membershipId}), due: ${dueDate.toDateString()}`,
      );

      return newRental;
    });

    return {
      status: 'success',
      message: `Book "${rental.book.title}" issued successfully to ${rental.member.name}`,
      data: rental,
    };
  }

  async returnBook(rentalId: number) {
    const updatedRental = await this.prisma.$transaction(async (tx) => {
      const rental = await tx.rental.findUnique({
        where: { id: rentalId },
        include: {
          member: { select: { name: true, membershipId: true } },
          book: { select: { title: true, totalCopies: true } },
        },
      });

      if (!rental) {
        throw new Error(`Rental #${rentalId} not found`);
      }

      if (rental.status === RentalStatus.Returned) {
        throw new Error(`Rental #${rentalId} has already been returned`);
      }

      const updatedRental = await tx.rental.update({
        where: { id: rentalId },
        data: {
          returnDate: new Date(),
          status: RentalStatus.Returned,
        },
        include: {
          member: { select: { name: true, membershipId: true } },
          book: { select: { title: true, author: true } },
          issuedBy: { select: { name: true } },
        },
      });

      await tx.book.update({
        where: { id: rental.bookId },
        data: {
          availableCopies: { increment: 1 },
        },
      });

      this.logger.log(
        `Book returned: "${rental.book.title}" from ${rental.member.name}`,
      );

      return updatedRental;
    });

    return {
      status: 'success',
      message: 'Book returned successfully',
      data: updatedRental,
    };
  }

  async findAll(query: GetRentalsDto) {
    const { status, page = 1, limit = 10 } = query;
    const { skip, take } = getPaginationParams(page, limit);

    const where: any = {};
    if (status) {
      where.status = status;
    }
    const [rentals, totalRentals] = await Promise.all([
      this.prisma.rental.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          member: { select: { name: true, membershipId: true, phone: true } },
          book: { select: { title: true, author: true, isbn: true } },
          issuedBy: { select: { name: true } },
        },
      }),
      this.prisma.rental.count({ where }),
    ]);

    return {
      status: 'success',
      message: 'Rentals retrieved successfully',
      data: rentals,
      totalRentals,
    };
  }

  async findByMember(memberId: number, query: GetRentalsDto) {
    const { page = 1, limit = 10 } = query;
    const { skip, take } = getPaginationParams(page, limit);

    const member = await this.prisma.member.findUnique({
      where: { id: memberId },
    });

    if (!member) {
      throw new Error(`Member #${memberId} not found`);
    }

    const [rentals, totalRentals] = await Promise.all([
      this.prisma.rental.findMany({
        where: { memberId },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          book: {
            select: { title: true, author: true, isbn: true, genre: true },
          },
          issuedBy: { select: { name: true } },
        },
      }),
      this.prisma.rental.count({ where: { memberId } }),
    ]);

    return {
      status: 'success',
      message: `Rentals for ${member.name} retrieved successfully`,
      data: {
        member: {
          id: member.id,
          name: member.name,
          membershipId: member.membershipId,
        },
        rentals,
        totalRentals,
      },
    };
  }

  async findOverdue() {
    const overdueRentals = await this.prisma.rental.findMany({
      where: { status: RentalStatus.Overdue },
      orderBy: { dueDate: 'asc' },
      include: {
        member: { select: { name: true, membershipId: true, phone: true } },
        book: { select: { title: true, author: true, isbn: true } },
        issuedBy: { select: { name: true } },
      },
    });

    return {
      status: 'success',
      message: 'Overdue rentals retrieved successfully',
      data: {
        total: overdueRentals.length,
      },
    };
  }
}
