import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, QueryFilter } from 'mongoose';
import { Task } from './entities/task.entity';
import { handleError } from '../../utils/methods/handleError';
import { ListProjectDto } from '../projects/dto/list-project.dto';
import { buildSearchRegex } from '../../utils/methods/build-search-regex';

@Injectable()
export class TasksService {
  constructor(
    @InjectModel(Task.name) private taskModel: Model<Task>,
  ) {}

  async create(projectId: string, createTaskDto: CreateTaskDto) {
    try {
      const findLastTask = await this.taskModel.findOne().sort({ code: -1 }).exec();
      const newCode = findLastTask ? findLastTask.code + 1 : 1;
      createTaskDto['code'] = newCode;
      createTaskDto['projectId'] = new Types.ObjectId(projectId);
      let buffer: Buffer | undefined;

      if (createTaskDto.description) {
        buffer = Buffer.from(createTaskDto.description, 'base64')
      }

      const createdTask = await this.taskModel.create({ ...createTaskDto, description: buffer });
      return {
        ...createdTask.toObject(),
        description: this.bufferToBase64(createdTask.description),
      }
    } catch (error) {
      handleError(error);
    }
  }

  async findAll(projectId: string,listTasksDto: ListProjectDto) {
    try {
      const page = Number(listTasksDto.page) || 1;
      const limit = Number(listTasksDto.limit) || 10;
      const query: QueryFilter<Task> = {
        projectId: new Types.ObjectId(projectId),
      }
      
      if (listTasksDto.keyword) {
        const regex = buildSearchRegex(listTasksDto.keyword);
        query['title'] = regex;
      }

      const countDocs = await this.taskModel.countDocuments(query);
      const tasks = await this.taskModel
        .find(query)
        .skip((page - 1) * limit)
        .limit(limit)
        .exec();

      return {
        total: countDocs,
        data: tasks.map(task => ({
          ...task.toObject(),
          description: this.bufferToBase64(task.description),
        })),
        page,
        limit,
      };
    } catch (error) {
      handleError(error);
    }
  }

  async findOne(id: string) {
    try {
      const findTask = await this.taskModel.findById(id).exec();
      if (!findTask) throw new NotFoundException('Tarefa não encontrada');

      return {
        ...findTask.toObject(),
        description: this.bufferToBase64(findTask.description),
      };
    } catch (error) {
      handleError(error);
    }
  }

  async update(id: string, updateTaskDto: UpdateTaskDto) {
    try {
      const findAndUpdateTask = await this.taskModel.findByIdAndUpdate(id, updateTaskDto, { new: true }).exec();
      if (!findAndUpdateTask) throw new NotFoundException('Tarefa não encontrada');

      return {
        ...findAndUpdateTask.toObject(),
        description: this.bufferToBase64(findAndUpdateTask.description),
      };
    } catch (error) {
      handleError(error);
    }
  }

  async remove(id: string) {
    try {
      const findAndDeleteTask = await this.taskModel.findByIdAndDelete(id).exec();
      if (!findAndDeleteTask) throw new NotFoundException('Tarefa não encontrada');

      return 'Task deletada com sucesso';
    } catch (error) {
      handleError(error);
    }
  }

  bufferToBase64(buffer: Buffer | null) {
    if (!buffer) return null
    return buffer.toString('base64')
  }
}
