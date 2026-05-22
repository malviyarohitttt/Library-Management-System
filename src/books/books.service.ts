import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookDto, UpdateBookDto, GetBooksDto } from './dto';
import { getPaginationParams } from '@Common';

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

    await this.prisma.book.create({
      data: {
        title: dto.title,
        genre: dto.genre,
        description: dto.description,
        publishedYear: dto.publishedYear,
        isbn: dto.isbn,
        totalCopies: dto.totalCopies,
        author: dto.author,
      },
    });

    return {
      status: 'success',
      message: 'Book added to library successfully',
    };
  }

  async findAll(query: GetBooksDto) {
    const { search, page = 1, limit = 10 } = query;

    const { skip, take } = getPaginationParams(page, limit);

    const where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { author: { contains: search, mode: 'insensitive' } },
        { isbn: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [books, totalBooks] = await Promise.all([
      this.prisma.book.findMany({
        where,
        skip,
        take,
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
      throw new NotFoundException(`Book with id ${id} not found`);
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

    await this.prisma.book.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description,
        author: dto.author,
        isbn: dto.isbn,
        publishedYear: dto.publishedYear,
        totalCopies: dto.totalCopies,
        genre: dto.genre,
      },
    });

    return {
      status: 'success',
      message: 'Book updated successfully',
    };
  }

  async remove(id: number) {
    await this.findOneOrFail(id);

    const activeRentals = await this.prisma.rental.count({
      where: { bookId: id, status: 'Issued' },
    });

    if (activeRentals > 0) {
      throw new BadRequestException(`Cannot delete book with active rentals.`);
    }

    await this.prisma.book.delete({ where: { id } });

    return {
      status: 'success',
      message: 'Book deleted successfully',
    };
  }

  async findOneOrFail(id: number) {
    const book = await this.prisma.book.findUnique({ where: { id } });
    if (!book) {
      throw new NotFoundException(`Book ${id} not found`);
    }
    return book;
  }
}
