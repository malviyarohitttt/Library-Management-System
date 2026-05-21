import { Module } from '@nestjs/common';
import { LibrariansService } from './librarians.service';
import { LibrariansController } from './librarians.controller';
import { PrismaModule } from 'src/prisma';

@Module({
  imports: [PrismaModule],
  controllers: [LibrariansController],
  providers: [LibrariansService],
  exports: [LibrariansService],
})
export class LibrariansModule {}
