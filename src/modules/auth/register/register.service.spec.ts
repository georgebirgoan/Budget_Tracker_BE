import { Test, TestingModule } from '@nestjs/testing';

describe('UserService', () => {

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [],
    }).compile();

    // service = module.get<>();
  });

  it('should be defined', () => {
    // expect(service).toBeDefined();
  });
});
