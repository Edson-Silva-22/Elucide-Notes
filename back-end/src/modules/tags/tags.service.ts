import { Injectable, ConflictException } from '@nestjs/common';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Tag } from './entities/tag.entity';
import { handleError } from '../../utils/methods/handleError';
import { ListTagDto } from './dto/list-tag.dto';
import { buildSearchRegex } from '../../utils/methods/build-search-regex';

@Injectable()
export class TagsService {
  constructor(
    @InjectModel(Tag.name) private tagModel: Model<Tag>,
  ) {}

  async create(projectId: string, createTagDto: CreateTagDto) {
    try {
      const existingTag = await this.tagModel.findOne({
        title: createTagDto.title,
        projectId: new Types.ObjectId(projectId),
        active: true
      }).exec();

      if (existingTag) {
        throw new ConflictException('Já existe uma tag com este título neste projeto');
      }

      const createdTag = await this.tagModel.create({
        ...createTagDto,
        projectId: new Types.ObjectId(projectId),
        active: true
      });

      return createdTag.toObject();
    } catch (error) {
      handleError(error);
    }
  }

  async findAll(projectId: string, listTagDto: ListTagDto) {
    try {
      const page = Number(listTagDto.page) || 1;
      const limit = Number(listTagDto.limit) || 10;
      const query: Record<string, unknown> = {
        projectId: new Types.ObjectId(projectId),
        active: true,
      }

      if (listTagDto.keyword) {
        const regex = buildSearchRegex(listTagDto.keyword);
        query['title'] = regex;
      }

      const countDocs = await this.tagModel.countDocuments(query);
      const tags = await this.tagModel
        .find(query)
        .skip((page - 1) * limit)
        .limit(limit)
        .exec();

      return {
        total: countDocs,
        data: tags.map(tag => tag.toObject()),
        page,
        limit,
      };
    } catch (error) {
      handleError(error);
    }
  }

  async findOne(id: string) {
    try {
      const findTag = await this.tagModel.findById(id).exec();
      if (!findTag || !findTag.active) throw new ConflictException('Tag não encontrada');

      return findTag.toObject();
    } catch (error) {
      handleError(error);
    }
  }

  async update(id: string, updateTagDto: UpdateTagDto) {
    try {
      const existingTag = await this.tagModel.findById(id).exec();
      if (!existingTag || !existingTag.active) throw new ConflictException('Tag não encontrada');

      if (updateTagDto.title && updateTagDto.title !== existingTag.title) {
        const duplicateTag = await this.tagModel.findOne({
          title: updateTagDto.title,
          projectId: existingTag.projectId,
          _id: { $ne: new Types.ObjectId(id) },
          active: true
        }).exec();

        if (duplicateTag) {
          throw new ConflictException('Já existe uma tag com este título neste projeto');
        }
      }

      const findAndUpdateTag = await this.tagModel.findByIdAndUpdate(id, updateTagDto, { new: true }).exec();
      if (!findAndUpdateTag) throw new ConflictException('Tag não encontrada');

      return findAndUpdateTag.toObject();
    } catch (error) {
      handleError(error);
    }
  }

  async remove(id: string) {
    try {
      const findAndDeleteTag = await this.tagModel.findByIdAndUpdate(
        id,
        { active: false },
        { new: true }
      ).exec();
      if (!findAndDeleteTag || findAndDeleteTag.active) throw new ConflictException('Tag não encontrada');

      return 'Tag deletada com sucesso';
    } catch (error) {
      handleError(error);
    }
  }
}
