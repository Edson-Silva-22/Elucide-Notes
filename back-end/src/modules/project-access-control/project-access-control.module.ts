import { Module } from '@nestjs/common';
import { ProjectAccessControlService } from './project-access-control.service';
import { ProjectAccessControlController } from './project-access-control.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ProjectAccessControl, ProjectAccessControlSchema } from './entities/project-access-control.entity';
import { User, UserSchema } from '../users/entities/user.entity';
import { Project, ProjectSchema } from '../projects/entities/project.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ProjectAccessControl.name, schema: ProjectAccessControlSchema },
      { name: User.name, schema: UserSchema },
      { name: Project.name, schema: ProjectSchema },
    ]), 
  ],
  controllers: [ProjectAccessControlController],
  providers: [ProjectAccessControlService],
  exports: [ProjectAccessControlService]
})
export class ProjectAccessControlModule {}
