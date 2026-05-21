import { Test, TestingModule } from '@nestjs/testing';
import { LibrariansService } from './librarians.service';

describe('LibrariansService', () => {
  let service: LibrariansService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LibrariansService],
    }).compile();

    service = module.get<LibrariansService>(LibrariansService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
