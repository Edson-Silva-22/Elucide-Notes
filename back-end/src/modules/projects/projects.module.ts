import { Module } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { Project, ProjectSchema } from './entities/project.entity';
import { MongooseModule } from '@nestjs/mongoose';
import { ProjectAccessControlModule } from '../project-access-control/project-access-control.module';
import { ProjectAccessControl, ProjectAccessControlSchema } from '../project-access-control/entities/project-access-control.entity';
import { User, UserSchema } from '../users/entities/user.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Project.name, schema: ProjectSchema },
      { name: ProjectAccessControl.name, schema: ProjectAccessControlSchema }
    ]),
    ProjectAccessControlModule
  ],
  controllers: [ProjectsController],
  providers: [ProjectsService],
})
export class ProjectsModule {}
