import { Prisma } from '../../src/generated/prisma/client';
import { MembershipStatus, Role } from '../../src/generated/prisma/enums';

export const librarian: Prisma.LibrarianCreateInput = {
  name: 'Rohit Malviya',
  email: process.env.LIBRARIAN_EMAIL || '',
  role: Role.Librarian,
  librarianMeta: {
    create: {
      passwordSalt: process.env.LIBRARIAN_PASSWORD_SALT || '',
      passwordHash: process.env.LIBRARIAN_PASSWORD_HASH || '',
    },
  },
};

export const members: Prisma.MemberCreateInput[] = [
  {
    membershipId: 'MEM-1001',
    name: 'Rahul Sharma',
    email: 'rahul@example.com',
    phone: '9876543210',
    address: 'Indore, MP',
    membershipStatus: MembershipStatus.Active,
  },
  {
    membershipId: 'MEM-1002',
    name: 'Priya Patel',
    email: 'priya@example.com',
    phone: '9876543211',
    address: 'Bhopal, MP',
    membershipStatus: MembershipStatus.Active,
  },
];

export const books: Prisma.BookCreateInput[] = [
  {
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    isbn: '978-0-7432-7356-5',
    genre: 'Fiction',
    description: 'A story of the fabulously wealthy Jay Gatsby',
    publishedYear: 1925,
    totalCopies: 3,
    availableCopies: 3,
  },
  {
    title: 'To Kill a Mockingbird',
    author: 'Harper Lee',
    isbn: '978-0-06-112008-4',
    genre: 'Fiction',
    description: 'A story of racial injustice and the loss of innocence',
    publishedYear: 1960,
    totalCopies: 2,
    availableCopies: 2,
  },
];
