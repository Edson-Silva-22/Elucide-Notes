# Skill: Generate Module (NestJS + Mongoose)

---

## 🎯 Objetivo

Gerar automaticamente um módulo completo no backend NestJS com Mongoose, incluindo:

* Estrutura de pastas
* Schema (entity)
* DTOs
* Service
* Controller
* Module

Baseado no nome do módulo e nas regras de negócio fornecidas.

---

## 🧠 Quando usar

* Ao iniciar um novo módulo
* Ao estruturar novas features
* Ao seguir padrão consistente no backend

---

## 🚫 Quando NÃO usar

* Para alterar módulos existentes
* Para lógica muito específica sem definição clara
* Para integração com sistemas externos complexos

---

## 📁 Contexto do projeto

```id="ctx-mod"
/front-end
/back-end
/docs
  /skills
```

⚠️ Tudo deve ser criado dentro de:

```id="ctx-back"
back-end/src/modules/
```

---

## 📥 Inputs esperados

### Obrigatório

```yaml id="input1"
module_name: string
```

Exemplo:

```yaml id="input2"
module_name: tasks
```

---

### Opcional (RECOMENDADO)

```yaml id="input3"
descricao: string
```

Exemplo:

```yaml id="input4"
descricao: gerenciamento de tarefas dentro de projetos
```

---

### 🔥 Principal (define tudo)

```yaml id="input5"
regras_de_negocio:
  - descrição textual das funcionalidades
```

Exemplo:

```yaml id="input6"
regras_de_negocio:
  - criar tarefa vinculada a um projeto
  - listar tarefas com paginação
  - buscar tarefas por palavra-chave
  - atualizar tarefa
  - deletar tarefa
```

---

### Opcional avançado

```yaml id="input7"
campos:
  - name: string
    type: string | number | boolean | date | objectId
    required: boolean
```

---

## 🧠 Resolução automática

A IA deve inferir:

* entity → singular do module_name
* nomes de classes:

  * TasksService
  * TasksController
  * TasksModule
* nomes de arquivos:

  * tasks.service.ts
  * tasks.controller.ts
  * tasks.module.ts
  * task.entity.ts

---

## 📁 Estrutura gerada

```id="structure"
/back-end/src/modules/<module>/
  ├── dto/
  │   ├── create-<entity>.dto.ts
  │   ├── update-<entity>.dto.ts
  │
  ├── entities/
  │   └── <entity>.entity.ts
  │
  ├── <module>.module.ts
  ├── <module>.service.ts
  ├── <module>.controller.ts
```

---

## ⚙️ Estratégia de geração

---

### 1. Entity (Mongoose Schema)

* Usar @Schema
* Usar @Prop
* Incluir timestamps
* Mapear campos do input (ou inferir básicos)

Exemplos de entity:
```ts id="entity-pattern"
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";

export enum TaskStatus {
  NOT_STARTED = 'not started',
  IN_PROGRESS = 'in progress',
  IN_REVIEW = 'in review',
  DONE = 'done',
}

@Schema({ timestamps: true })
export class Task {
  @Prop()
  code!: number;

  @Prop()
  title!: string;
  
  @Prop({ type: Buffer })
  description!: Buffer;

  @Prop({ default: TaskStatus.NOT_STARTED })
  status!: TaskStatus;

  @Prop({ default: [] })
  tags!: string[];

  @Prop({
    type: Types.ObjectId,
    ref: 'Project',
    required: true
  })
  projectId!: Types.ObjectId;
}

export const TaskSchema = SchemaFactory.createForClass(Task);
```
---

### 2. DTOs

Criar:

* Create DTO → campos obrigatórios
* Update DTO → PartialType(CreateDto)
* List DTO → Usado para paginação e filtros
* Utilizar class-validator para validação
* Utilizar class-transformer para conversão de tipos se necessário

Exemplos de DTOs:
```ts id="create-dto-pattern"
import { IsArray, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateTaskDto {
  @IsNotEmpty({ message: 'O título deve ser informado' })
  @IsString({ message: 'O título deve ser uma string' })
  title!: string;

  @IsOptional()
  @IsString({ message: 'A descrição deve ser uma string' })
  description?: string;

  @IsOptional()
  @IsArray({ message: 'As tags devem ser um array' })
  @IsString({ each: true, message: 'Cada tag deve ser uma string' })
  tags?: string[];
}
```

```ts id="update-dto-pattern"
import { PartialType } from '@nestjs/mapped-types';
import { CreateTaskDto } from './create-task.dto';

export class UpdateTaskDto extends PartialType(CreateTaskDto) {}
```

```ts id="list-dto-pattern"
export class ListTaskDto {
  keyword?: string;
  status?: string;
  tags?: string[];
  page?: number;
  limit?: number;
}
```
---

### 3. Service

Para cada regra de negócio:

Gerar métodos como:

```ts id="svc-pattern"
create()
findAll()
findOne()
update()
remove()
```

Com:

* try/catch
* uso do model mongoose
* tratamento de erro via helper (se padrão existir)

Exemplos de service:
```ts id="svc-example"
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
```

---

### 4. Controller

Gerar endpoints REST:

```ts id="ctrl-pattern"
@Post()
@Get()
@Get(':id')
@Patch(':id')
@Delete(':id')
```

Mapeando regras → endpoints

Exemplos de controller:
```ts id="ctrl-example"
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Put,
  Delete,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { ListProjectDto } from '../projects/dto/list-project.dto';
import { AuthGuard } from '../auth/auth.guard';
import { ProjectAccessControlGuard } from '../project-access-control/project-access-control.guard';
import { UpdateTaskDto } from './dto/update-task.dto';

@Controller('projects/:id/tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @UseGuards(AuthGuard, ProjectAccessControlGuard)
  async create(@Param('id') projectId: string, @Body() createTaskDto: CreateTaskDto) {
    return await this.tasksService.create(projectId, createTaskDto);
  }

  @Get()
  @UseGuards(AuthGuard, ProjectAccessControlGuard)
  async findAll(@Param('id') projectId: string, @Query() listTaskDto: ListProjectDto) {
    return await this.tasksService.findAll(projectId, listTaskDto);
  }

  @Get(':taskId')
  @UseGuards(AuthGuard, ProjectAccessControlGuard)
  async findOne(@Param('taskId') id: string) {
    return await this.tasksService.findOne(id);
  }

  @Put(':taskId')
  @UseGuards(AuthGuard, ProjectAccessControlGuard)
  async update(@Param('taskId') id: string, @Body() updateTaskDto: UpdateTaskDto) {
    return await this.tasksService.update(id, updateTaskDto);
  }

  @Delete(':taskId')
  @UseGuards(AuthGuard, ProjectAccessControlGuard)
  async remove(@Param('taskId') id: string) {
    return await this.tasksService.remove(id);
  }
}
```

Lembrete: Perguntar ao usuário sobre o uso de guardas nas rotas caso não seja especificado explicitamente.
---

### 5. Module

```ts id="module-pattern"
@Module({
  imports: [
    MongooseModule.forFeature([{ name: Entity.name, schema: EntitySchema }])
  ],
  controllers: [Controller],
  providers: [Service],
})
```

A IA deve inserir as depêndencias que o module ira usar. Após a criação do module a IA deve importa o module criado no app.module.ts.
---

## 📏 Regras obrigatórias

* Seguir padrão NestJS
* Seguir convenção de nomes (plural/singular)
* Controller não deve conter lógica de negócio
* Service deve conter lógica
* DTOs devem validar entrada
* Entity deve refletir dados persistidos

---

## 🧪 Convenções de código

* async/await
* try/catch em todos métodos do service
* uso de Types.ObjectId quando necessário
* retorno consistente

---

## 🔁 Variações

* módulos com relacionamento (ex: projectId)
* módulos com busca (keyword)
* módulos com paginação
* módulos com autenticação

---

## 🚀 Execução

### Exemplo simples

```txt id="exec-mod1"
Use a skill: docs/skills/generate-module.md

Input:
- module_name: tasks

- regras_de_negocio:
  - criar tarefa
  - listar tarefas
  - atualizar tarefa
  - deletar tarefa
```

---

### Exemplo completo

```txt id="exec-mod2"
Use a skill: docs/skills/generate-module.md

Input:
- module_name: tasks

- descricao: gerenciamento de tarefas

- regras_de_negocio:
  - criar tarefa vinculada a um projeto
  - listar tarefas com paginação
  - buscar tarefas por palavra-chave
  - atualizar tarefa
  - deletar tarefa

- campos:
  - name: title
    type: string
    required: true
  - name: description
    type: string
    required: false
  - name: projectId
    type: objectId
    required: true
```

---

## 🧠 Filosofia da skill

* Estrutura vem antes da implementação
* Código deve ser previsível
* Convenções > criatividade
* Inputs guiam comportamento, não código

---
