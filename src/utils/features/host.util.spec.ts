import { Test, TestingModule } from '@nestjs/testing';
import { HostUtil } from './host.util';

describe('Host', () => {
  let provider: HostUtil;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HostUtil],
    }).compile();

    provider = module.get<HostUtil>(HostUtil);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
