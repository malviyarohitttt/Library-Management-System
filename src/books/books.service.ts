import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookDto, UpdateBookDto, GetBooksDto } from './dto';
import { getPaginationParams } from '../common/utils/pagination.utils';

@Injectable()
export class BooksService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateBookDto) {
    const existing = await this.prisma.book.findUnique({
      where: { isbn: dto.isbn },
    });

    if (existing) {
      throw new ConflictException(
        `A book with ISBN ${dto.isbn} already exists`,
      );
    }

    const book = await this.prisma.book.create({
      data: {
        ...dto,
        availableCopies: dto.totalCopies,
      },
    });

    return {
      status: 'success',
      message: 'Book added to library successfully',
      data: book,
    };
  }

  async findAll(query: GetBooksDto) {
    const {
      search,
      author,
      genre,
      available,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 10,
    } = query;

    const { skip, take } = getPaginationParams(page, limit);

    const where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { author: { contains: search, mode: 'insensitive' } },
        { isbn: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (author) {
      where.author = { contains: author, mode: 'insensitive' };
    }

    if (genre) {
      where.genre = { contains: genre, mode: 'insensitive' };
    }

    if (available === 'true') {
      where.availableCopies = { gt: 0 };
    }

    const allowedSortFields = [
      'title',
      'author',
      'genre',
      'createdAt',
      'availableCopies',
    ];
    const orderByField = allowedSortFields.includes(sortBy)
      ? sortBy
      : 'createdAt';

    const [books, totalBooks] = await Promise.all([
      this.prisma.book.findMany({
        where,
        skip,
        take,
        orderBy: { [orderByField]: sortOrder },
        include: {
          _count: {
            select: {
              rentals: {
                where: { status: 'Issued' },
              },
            },
          },
        },
      }),
      this.prisma.book.count({ where }),
    ]);

    return {
      status: 'success',
      message: 'Books retrieved successfully',
      totalBooks,
      data: books,
    };
  }

  async findOne(id: number) {
    const book = await this.prisma.book.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            rentals: {
              where: { status: 'Issued' },
            },
          },
        },
      },
    });

    if (!book) {
      throw new NotFoundException(`Book #${id} not found`);
    }

    return {
      status: 'success',
      message: 'Book retrieved successfully',
      data: book,
    };
  }

  async update(id: number, dto: UpdateBookDto) {
    const book = await this.findOneOrFail(id);

    if (dto.totalCopies !== undefined) {
      const activeRentals = await this.prisma.rental.count({
        where: { bookId: id, status: 'Issued' },
      });

      if (dto.totalCopies < activeRentals) {
        throw new BadRequestException(
          `Cannot set total copies to ${dto.totalCopies}. There are ${activeRentals} active rentals.`,
        );
      }

      const rentedCopies = book.totalCopies - book.availableCopies;
      const newAvailableCopies = dto.totalCopies - rentedCopies;

      if (newAvailableCopies < 0) {
        throw new BadRequestException(
          'New total copies cannot be less than currently rented copies',
        );
      }

      dto = { ...dto };
      (dto as any).availableCopies = newAvailableCopies;
    }

    if (dto.isbn && dto.isbn !== book.isbn) {
      const existing = await this.prisma.book.findFirst({
        where: { isbn: dto.isbn, NOT: { id } },
      });
      if (existing) {
        throw new ConflictException(
          `A book with ISBN ${dto.isbn} already exists`,
        );
      }
    }

    const updated = await this.prisma.book.update({
      where: { id },
      data: dto,
    });

    return {
      status: 'success',
      message: 'Book updated successfully',
      data: updated,
    };
  }

  async remove(id: number) {
    await this.findOneOrFail(id);

    const activeRentals = await this.prisma.rental.count({
      where: { bookId: id, status: 'Issued' },
    });

    if (activeRentals > 0) {
      throw new BadRequestException(
        `Cannot delete book with ${activeRentals} active rental(s). Return all copies first.`,
      );
    }

    await this.prisma.book.delete({ where: { id } });

    return {
      status: 'success',
      message: 'Book deleted successfully',
      data: null,
    };
  }

  async findOneOrFail(id: number) {
    const book = await this.prisma.book.findUnique({ where: { id } });
    if (!book) {
      throw new NotFoundException(`Book #${id} not found`);
    }
    return book;
  }
}
