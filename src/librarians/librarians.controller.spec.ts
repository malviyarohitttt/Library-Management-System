import { Test, TestingModule } from '@nestjs/testing';
import { LibrariansController } from './librarians.controller';
import { LibrariansService } from './librarians.service';

describe('LibrariansController', () => {
  let controller: LibrariansController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LibrariansController],
      providers: [LibrariansService],
    }).compile();

    controller = module.get<LibrariansController>(LibrariansController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
