import { Module } from '@nestjs/common';
import { TagsService } from './tags.service';
import { TagsController } from './tags.controller';
import { Tag, TagSchema } from './entities/tag.entity';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { ProjectAccessControlModule } from '../project-access-control/project-access-control.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Tag.name, schema: TagSchema }
    ]),
    JwtModule,
    ProjectAccessControlModule
  ],
  controllers: [TagsController],
  providers: [TagsService],
})
export class TagsModule {}
