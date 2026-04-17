import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Task, TaskSchema } from './entities/task.entity';
import { ProjectAccessControlModule } from '../project-access-control/project-access-control.module';
import { TasksController } from './tasks.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Task.name, schema: TaskSchema }]),
    ProjectAccessControlModule
  ],
  controllers: [TasksController],
  providers: [TasksService],
})
export class TasksModule {}
