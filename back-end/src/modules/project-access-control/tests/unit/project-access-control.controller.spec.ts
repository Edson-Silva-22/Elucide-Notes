import { Test, TestingModule } from '@nestjs/testing';
import { ProjectAccessControlController } from '../../project-access-control.controller';
import { ProjectAccessControlService } from '../../project-access-control.service';

describe('ProjectAccessControlController', () => {
  let controller: ProjectAccessControlController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProjectAccessControlController],
      providers: [ProjectAccessControlService],
    }).compile();

    controller = module.get<ProjectAccessControlController>(
      ProjectAccessControlController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
