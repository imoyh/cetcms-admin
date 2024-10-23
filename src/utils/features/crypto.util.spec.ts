import { Test, TestingModule } from '@nestjs/testing';
import { CryptoUtil } from './crypto.util';

describe('Crypto', () => {
  let provider: CryptoUtil;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CryptoUtil],
    }).compile();

    provider = module.get<CryptoUtil>(CryptoUtil);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
