import 'dotenv/config';
import { Command } from 'commander';
import { isEmail } from 'class-validator';
import { librarian, members, books } from './seeds';
import { PrismaClient } from '../src/generated/prisma/client';

const program = new Command();
program.option('--seed-only <name>', 'Specify a seed name').parse(process.argv);

const prisma = new PrismaClient();

async function main() {
  const options = program.opts();
  /**
   * Seed Librarian
   */
  if (!options.seedOnly || options.seedOnly === 'librarian') {
    if (await prisma.librarian.count()) {
      console.log('⚠ Skipping seed for `librarian`, due to non-empty table');
    } else {
      if (
        isEmail(librarian.email) &&
        librarian.librarianMeta?.create?.passwordHash &&
        librarian.librarianMeta.create.passwordSalt
      ) {
        await prisma.librarian.create({ data: librarian });
        console.log('librarian seeded');
      } else {
        throw new Error('Invalid default librarian credentials found');
      }
    }
  }

  /**
   * Seed Members
   */
  if (!options.seedOnly || options.seedOnly === 'members') {
    for (const member of members) {
      await prisma.member.upsert({
        where: { membershipId: member.membershipId },
        update: {},
        create: member,
      });
    }

    console.log(`${members.length} members seeded`);
  }

  /**
   * Seed Books
   */
  if (!options.seedOnly || options.seedOnly === 'books') {
    for (const book of books) {
      await prisma.book.upsert({
        where: { isbn: book.isbn },
        update: {},
        create: book,
      });
    }

    console.log(`${books.length} books seeded`);
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
