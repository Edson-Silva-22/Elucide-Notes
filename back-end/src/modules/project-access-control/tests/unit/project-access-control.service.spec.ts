import { Test, TestingModule } from '@nestjs/testing';
import { ProjectAccessControlService } from '../../project-access-control.service';

describe('ProjectAccessControlService', () => {
  let service: ProjectAccessControlService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProjectAccessControlService],
    }).compile();

    service = module.get<ProjectAccessControlService>(
      ProjectAccessControlService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
