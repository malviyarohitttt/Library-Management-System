/* eslint-disable prettier/prettier */
import { Test, TestingModule } from '@nestjs/testing';
import { MembersService } from './members.service';
import { describe, beforeEach, it } from 'node:test';

describe('MembersService', () => {
  let service: MembersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MembersService],
    }).compile();

    service = module.get<MembersService>(MembersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
