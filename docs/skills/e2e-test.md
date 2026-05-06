# Skill: E2E Test (NestJS + MongoDB)

---

## 🎯 Objetivo

Gerar testes end-to-end completos para módulos do NestJS utilizando:

* MongoDB real (database de teste)
* Supertest
* Fluxo completo HTTP
* Autenticação via JWT
* Mocks reutilizáveis para criação de dados

---

## 🧠 Quando usar

* Validar fluxo completo da API
* Garantir integração entre módulos
* Testar autenticação e autorização
* Validar validação de DTOs

---

## 🚫 Quando NÃO usar

* Para testar lógica isolada (use unit tests)
* Para testar controllers isoladamente
* Para testes rápidos (E2E é mais lento)

---

## 📁 Contexto do projeto

```id="ctx-e2e"
/front-end
/back-end
/docs
  /skills
```

---

## 📥 Inputs esperados

### Obrigatório

```yaml id="input-e2e-1"
module_name: string
```

Exemplo:

```yaml id="input-e2e-2"
module_name: tasks
```

---

### Opcional (RECOMENDADO)

```yaml id="input-e2e-3"
regras_de_negocio:
  - descrição dos fluxos que devem ser testados
```

---

### Opcional avançado

```yaml id="input-e2e-4"
dependencies:
  - users
  - projects
```

---

## 🧠 Resolução automática

A IA deve inferir:

* endpoints a partir do controller
* dependências entre módulos
* necessidade de autenticação
* uso de projectId, userId, etc

---

## 📁 Estrutura de arquivos

```id="structure-e2e"
/back-end/src/modules/<module>/tests/e2e/<module>.e2e.spec.ts
```

Mocks:

```id="structure-mocks"
/back-end/src/modules/<module>/tests/mocks/<module>.mocks.ts
```

---

## ⚙️ Estratégia de execução

---

### 1. Setup da aplicação

```ts id="setup-e2e"
beforeAll(async () => {
  const moduleTest: TestingModule = await Test.createTestingModule({
    imports: [
      ConfigModule.forRoot({ isGlobal: true }),
      MongooseModule.forRoot(process.env.MONGODB_URI_TESTS, {
        dbName: process.env.MONGODB_DB_NAME_TESTS,
      }),
      AppModule,
    ],
  }).compile();

  app = moduleTest.createNestApplication();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  connection = moduleTest.get(getConnectionToken());
  await app.init();
});
```

---

### 2. Limpeza do banco

```ts id="cleanup"
beforeEach(async () => {
  await connection.collection('users').deleteMany({});
  await connection.collection('projects').deleteMany({});
  await connection.collection('<module>').deleteMany({});
});
```

---

### 3. Encerramento

```ts id="teardown"
afterAll(async () => {
  await connection.dropDatabase();
  await connection.close();
  await app.close();
});
```

---

## 🧪 Uso de mocks (OBRIGATÓRIO)

A IA deve reutilizar mocks existentes.

Exemplo:

```ts id="mock-usage"
import { createTestUser } from '../../users/tests/mocks/users.mocks';
import { createTestProject } from '../../projects/tests/mocks/projects.mocks';
import { createTestTask } from '../mocks/tasks.mocks';
```

## 🧪 Criação de mocks (OBRIGATÓRIO)

A IA deve criar mocks necessários para realização do teste. A crição dos mocks devem ser realizadas no arquivo de mocks.

Exemplo:

```ts id="mock-creation"
export const mockTask: Task = {
  code: 1,
  title: 'Test Task',
  description: createDescriptionBuffer('This is a test task'),
  status: TaskStatus.NOT_STARTED,
  tags: ['tag1'],
  projectId: new Types.ObjectId('507f1f77bcf86cd799439011'),
};
```

## 🧪 Criação de Funções Helper (OBRIGATÓRIO)

A IA deve criar funções helpe para realização do teste e que poderam ser reutilizadas por testes de outros módulos.

Exemplo:

```ts id="helper-creation"
export async function createTestTask(
  app: INestApplication, 
  createTaskDto: CreateTaskDto,
  jwtToken: string,
  projectId: string
): Promise<Task & { _id: string, createdAt: Date, updatedAt: Date }> {
  const response = await request(app.getHttpServer())
    .post(`/projects/${projectId}/tasks`)
    .set('Authorization', `Bearer ${jwtToken}`)
    .send(createTaskDto)
    .expect(201);

  expect(response.body).toMatchObject(createTaskDto);

  return response.body;
} 
```
---

## ⚠️ Regra crítica

> ❗ NÃO criar dados manualmente via model
> ❗ SEMPRE usar funções helper (mocks)

---

## 🧪 Estrutura dos testes

---

Os testes devem ser organizados por endpoint utilizando `describe`.

Cada endpoint deve ter seu próprio bloco `describe`, contendo todos os cenários relacionados.

---

### 📦 Padrão de organização

```ts
describe('<METHOD> <endpoint>', () => {

  it('should ...', async () => { ... })

  it('should ...', async () => { ... })

});
```

---

### 🔥 Exemplo real

```ts
describe('POST /projects/:id/tasks', () => {

  it('should create a new task', async () => { ... });

  it('should not create with invalid data', async () => { ... });

  it('should not create without authentication', async () => { ... });

  it('should not create without permission', async () => { ... });

});
```

---

### 📌 Regras obrigatórias

* Cada endpoint deve possuir um `describe` próprio

* O nome do `describe` deve seguir o padrão:

  ```
  <HTTP_METHOD> <endpoint>
  ```

* Todos os cenários do endpoint devem estar dentro do mesmo bloco

* Não misturar testes de endpoints diferentes no mesmo `describe`

---

### 🎯 Cenários dentro de cada describe

Cada bloco pode conter:

* ✅ Sucesso
* ❌ Bad Request (400)
* ❌ Validação (400)
* 🔐 Não autenticado (401)
* 🚫 Não autorizado (403)
* 🔍 Não encontrado (404)
* 🚫 Erro interno (501)
* entre outros

---

### 🚀 Regra de ouro

> Um endpoint = um `describe`
> Um cenário = um `it`

---

## 📏 Regras obrigatórias

* Sempre usar banco real de teste
* Sempre limpar o banco antes de cada teste
* Sempre usar autenticação quando necessário
* Sempre validar response.body
* Sempre usar mocks reutilizáveis

---

## 🔁 Variações

* endpoints com relacionamento (projectId)
* paginação
* busca por keyword
* validação com class-validator
* autorização baseada em usuário

---

## 🚀 Execução

```txt id="exec-e2e"
Use a skill: docs/skills/e2e-test.md

Input:
- module_name: tasks

- regras_de_negocio:
  - criar task vinculada a projeto
  - listar tasks com paginação
  - buscar por keyword
  - atualizar task
  - deletar task
```

---

## 🧠 Filosofia

* E2E testa comportamento real
* Não mocka banco
* Não mocka service
* Simula usuário real
* Fluxo completo sempre

---

## Referências
task.e2e-spec.ts:

```ts
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { MongooseModule, getConnectionToken } from '@nestjs/mongoose';
import { TestingModule, Test } from '@nestjs/testing';
import { Connection } from 'mongoose';
import { AppModule } from '../../../../app.module';
import { createTestProject } from '../../../projects/tests/mocks/projects.mocks';
import { createProjectDtoMock } from '../../../projects/tests/mocks/projects.mocks';
import { createTestUser } from '../../../users/tests/mocks/users.mocks';
import { createUserDtoMock } from '../../..//users/tests/mocks/users.mocks';
import request from 'supertest';
import {
  mockCreateTaskDto,
  createTestTask,
  mockUpdateTaskDto,
} from '../mocks/tasks.mocks';

describe('Tasks Endpoints', () => {
  let app: INestApplication;
  let connection: Connection;
  let jwtService: JwtService;

  beforeAll(async () => {
    const moduleTest: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
        }),
        MongooseModule.forRoot(
          process.env.MONGODB_URI_TESTS || 'mongodb://localhost:27017/',
          {
            dbName: process.env.MONGODB_DB_NAME_TESTS || 'elucide-notes-tests',
          },
        ),
        AppModule,
      ],
    }).compile();

    app = moduleTest.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );
    connection = moduleTest.get<Connection>(getConnectionToken());
    await app.init();

    jwtService = moduleTest.get(JwtService);
  });

  beforeEach(async () => {
    await connection
      .useDb(process.env.MONGODB_DB_NAME_TESTS || 'elucide-notes-tests')
      .collection('projects')
      .deleteMany({});
    await connection
      .useDb(process.env.MONGODB_DB_NAME_TESTS || 'elucide-notes-tests')
      .collection('users')
      .deleteMany({});
    await connection
      .useDb(process.env.MONGODB_DB_NAME_TESTS || 'elucide-notes-tests')
      .collection('tasks')
      .deleteMany({});
  });

  afterAll(async () => {
    await connection
      .useDb(process.env.MONGODB_DB_NAME_TESTS || 'elucide-notes-tests')
      .dropDatabase();
    await connection.close();
    await app.close();
  });

  describe('POST /projects/:id/tasks', () => {
    it('should create a new task', async () => {
      const createUserResponse = await createTestUser(
        app,
        createUserDtoMock,
        connection,
      );
      const createProjectResponse = await createTestProject(
        app,
        createProjectDtoMock,
        createUserResponse.token,
      );

      const createTaskResponse = await createTestTask(
        app,
        mockCreateTaskDto,
        createUserResponse.token,
        createProjectResponse._id,
      );

      expect(createTaskResponse).toMatchObject(mockCreateTaskDto);
    });

    it('should create a new task with code auto-incremented', async () => {
      const createUserResponse = await createTestUser(
        app,
        createUserDtoMock,
        connection,
      );
      const createProjectResponse = await createTestProject(
        app,
        createProjectDtoMock,
        createUserResponse.token,
      );

      const createTaskResponse1 = await createTestTask(
        app,
        mockCreateTaskDto,
        createUserResponse.token,
        createProjectResponse._id,
      );
      const createTaskResponse2 = await createTestTask(
        app,
        mockCreateTaskDto,
        createUserResponse.token,
        createProjectResponse._id,
      );

      expect(createTaskResponse1.code).toBe(1);
      expect(createTaskResponse2.code).toBe(2);
    });

    it('should not create a new task with invalid data', async () => {
      const createUserResponse = await createTestUser(
        app,
        createUserDtoMock,
        connection,
      );
      const createProjectResponse = await createTestProject(
        app,
        createProjectDtoMock,
        createUserResponse.token,
      );

      const invalidTaskDto = {};

      const response = await request(app.getHttpServer())
        .post(`/projects/${createProjectResponse._id}/tasks`)
        .set('Authorization', `Bearer ${createUserResponse.token}`)
        .send(invalidTaskDto)
        .expect(400);

      expect(response.body).toMatchObject({
        statusCode: 400,
        error: 'Bad Request',
        message: expect.arrayContaining([
          'O título deve ser uma string',
          'O título deve ser informado',
        ]),
      });
    });

    it('should not create a new task without authentication', async () => {
      const createUserResponse = await createTestUser(
        app,
        createUserDtoMock,
        connection,
      );
      const createProjectResponse = await createTestProject(
        app,
        createProjectDtoMock,
        createUserResponse.token,
      );

      const response = await request(app.getHttpServer())
        .post(`/projects/${createProjectResponse._id}/tasks`)
        .send(mockCreateTaskDto)
        .expect(401);

      expect(response.body).toEqual({
        status: 401,
        message: 'Unauthorized',
      });
    });

    it('should not create a new task without access to the project', async () => {
      const createUserResponse = await createTestUser(
        app,
        createUserDtoMock,
        connection,
      );
      const createProjectResponse = await createTestProject(
        app,
        createProjectDtoMock,
        createUserResponse.token,
      );

      const anotherUserResponse = await createTestUser(
        app,
        {
          ...createUserDtoMock,
          name: 'Another User',
          email: 'another@email.com',
        },
        connection,
      );

      const response = await request(app.getHttpServer())
        .post(`/projects/${createProjectResponse._id}/tasks`)
        .set('Authorization', `Bearer ${anotherUserResponse.token}`)
        .send(mockCreateTaskDto)
        .expect(403);

      expect(response.body).toEqual({
        statusCode: 403,
        message: 'Acesso negado para este projeto.',
        error: 'Forbidden',
      });
    });
  });

  describe('GET /projects/:id/tasks', () => {
    it('should get all tasks from a project', async () => {
      const createUserResponse = await createTestUser(
        app,
        createUserDtoMock,
        connection,
      );
      const createProjectResponse = await createTestProject(
        app,
        createProjectDtoMock,
        createUserResponse.token,
      );

      await createTestTask(
        app,
        mockCreateTaskDto,
        createUserResponse.token,
        createProjectResponse._id,
      );

      const anotherTaskDto = { ...mockCreateTaskDto, title: 'Another Task' };

      await createTestTask(
        app,
        anotherTaskDto,
        createUserResponse.token,
        createProjectResponse._id,
      );

      const response = await request(app.getHttpServer())
        .get(`/projects/${createProjectResponse._id}/tasks`)
        .set('Authorization', `Bearer ${createUserResponse.token}`)
        .expect(200);

      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0]).toMatchObject(mockCreateTaskDto);
      expect(response.body.data[1]).toMatchObject(anotherTaskDto);
    });

    it('should get all tasks from a project with pagination and keyword search', async () => {
      const createUserResponse = await createTestUser(
        app,
        createUserDtoMock,
        connection,
      );
      const createProjectResponse = await createTestProject(
        app,
        createProjectDtoMock,
        createUserResponse.token,
      );

      await createTestTask(
        app,
        mockCreateTaskDto,
        createUserResponse.token,
        createProjectResponse._id,
      );

      const anotherTaskDto = { ...mockCreateTaskDto, title: 'Another Task' };

      await createTestTask(
        app,
        anotherTaskDto,
        createUserResponse.token,
        createProjectResponse._id,
      );

      const response = await request(app.getHttpServer())
        .get(
          `/projects/${createProjectResponse._id}/tasks?keyword=Test&page=1&limit=10`,
        )
        .set('Authorization', `Bearer ${createUserResponse.token}`)
        .expect(200);

      expect(response.body).toMatchObject({
        total: 1,
        data: [mockCreateTaskDto],
        page: 1,
        limit: 10,
      });
    });

    it('should not get tasks without authentication', async () => {
      const createUserResponse = await createTestUser(
        app,
        createUserDtoMock,
        connection,
      );
      const createProjectResponse = await createTestProject(
        app,
        createProjectDtoMock,
        createUserResponse.token,
      );

      const response = await request(app.getHttpServer())
        .get(`/projects/${createProjectResponse._id}/tasks`)
        .expect(401);

      expect(response.body).toEqual({
        status: 401,
        message: 'Unauthorized',
      });
    });

    it('should not get tasks without access to the project', async () => {
      const createUserResponse = await createTestUser(
        app,
        createUserDtoMock,
        connection,
      );
      const createProjectResponse = await createTestProject(
        app,
        createProjectDtoMock,
        createUserResponse.token,
      );

      const anotherUserResponse = await createTestUser(
        app,
        {
          ...createUserDtoMock,
          name: 'Another User',
          email: 'another@email.com',
        },
        connection,
      );

      const response = await request(app.getHttpServer())
        .get(`/projects/${createProjectResponse._id}/tasks`)
        .set('Authorization', `Bearer ${anotherUserResponse.token}`)
        .expect(403);

      expect(response.body).toEqual({
        statusCode: 403,
        message: 'Acesso negado para este projeto.',
        error: 'Forbidden',
      });
    });
  });

  describe('GET /projects/:id/tasks/:taskId', () => {
    it('should get a task by id', async () => {
      const createUserResponse = await createTestUser(
        app,
        createUserDtoMock,
        connection,
      );
      const createProjectResponse = await createTestProject(
        app,
        createProjectDtoMock,
        createUserResponse.token,
      );

      const createTaskResponse = await createTestTask(
        app,
        mockCreateTaskDto,
        createUserResponse.token,
        createProjectResponse._id,
      );

      const response = await request(app.getHttpServer())
        .get(
          `/projects/${createProjectResponse._id}/tasks/${createTaskResponse._id}`,
        )
        .set('Authorization', `Bearer ${createUserResponse.token}`)
        .expect(200);

      expect(response.body).toMatchObject(mockCreateTaskDto);
    });

    it('should not get a task without authentication', async () => {
      const createUserResponse = await createTestUser(
        app,
        createUserDtoMock,
        connection,
      );
      const createProjectResponse = await createTestProject(
        app,
        createProjectDtoMock,
        createUserResponse.token,
      );

      const createTaskResponse = await createTestTask(
        app,
        mockCreateTaskDto,
        createUserResponse.token,
        createProjectResponse._id,
      );

      const response = await request(app.getHttpServer())
        .get(
          `/projects/${createProjectResponse._id}/tasks/${createTaskResponse._id}`,
        )
        .expect(401);

      expect(response.body).toEqual({
        status: 401,
        message: 'Unauthorized',
      });
    });

    it('should not get a task without access to the project', async () => {
      const createUserResponse = await createTestUser(
        app,
        createUserDtoMock,
        connection,
      );
      const createProjectResponse = await createTestProject(
        app,
        createProjectDtoMock,
        createUserResponse.token,
      );

      const createTaskResponse = await createTestTask(
        app,
        mockCreateTaskDto,
        createUserResponse.token,
        createProjectResponse._id,
      );

      const anotherUserResponse = await createTestUser(
        app,
        {
          ...createUserDtoMock,
          name: 'Another User',
          email: 'another@email.com',
        },
        connection,
      );

      const response = await request(app.getHttpServer())
        .get(
          `/projects/${createProjectResponse._id}/tasks/${createTaskResponse._id}`,
        )
        .set('Authorization', `Bearer ${anotherUserResponse.token}`)
        .expect(403);

      expect(response.body).toEqual({
        statusCode: 403,
        message: 'Acesso negado para este projeto.',
        error: 'Forbidden',
      });
    });

    it('should not get a task that does not exist', async () => {
      const createUserResponse = await createTestUser(
        app,
        createUserDtoMock,
        connection,
      );
      const createProjectResponse = await createTestProject(
        app,
        createProjectDtoMock,
        createUserResponse.token,
      );

      const response = await request(app.getHttpServer())
        .get(
          `/projects/${createProjectResponse._id}/tasks/678f1a2b3c4d5e6f7a8b9c0d`,
        )
        .set('Authorization', `Bearer ${createUserResponse.token}`)
        .expect(404);

      expect(response.body).toEqual({
        statusCode: 404,
        message: 'Tarefa não encontrada',
        error: 'Not Found',
      });
    });
  });

  describe('PUT /projects/:id/tasks/:taskId', () => {
    it('should update a task by id', async () => {
      const createUserResponse = await createTestUser(
        app,
        createUserDtoMock,
        connection,
      );
      const createProjectResponse = await createTestProject(
        app,
        createProjectDtoMock,
        createUserResponse.token,
      );

      const createTaskResponse = await createTestTask(
        app,
        mockCreateTaskDto,
        createUserResponse.token,
        createProjectResponse._id,
      );

      const response = await request(app.getHttpServer())
        .put(
          `/projects/${createProjectResponse._id}/tasks/${createTaskResponse._id}`,
        )
        .set('Authorization', `Bearer ${createUserResponse.token}`)
        .send(mockUpdateTaskDto)
        .expect(200);

      expect(response.body).toMatchObject({
        ...mockUpdateTaskDto,
        description: "VkdocGN5QnBjeUJoSUhSbGMzUWdkR0Z6YXc9PQ=="
      });
    });

    it('should not update a task without authentication', async () => {
      const createUserResponse = await createTestUser(
        app,
        createUserDtoMock,
        connection,
      );
      const createProjectResponse = await createTestProject(
        app,
        createProjectDtoMock,
        createUserResponse.token,
      );

      const createTaskResponse = await createTestTask(
        app,
        mockCreateTaskDto,
        createUserResponse.token,
        createProjectResponse._id,
      );

      const response = await request(app.getHttpServer())
        .put(
          `/projects/${createProjectResponse._id}/tasks/${createTaskResponse._id}`,
        )
        .send(mockUpdateTaskDto)
        .expect(401);

      expect(response.body).toEqual({
        status: 401,
        message: 'Unauthorized',
      });
    });

    it('should not update a task without access to the project', async () => {
      const createUserResponse = await createTestUser(
        app,
        createUserDtoMock,
        connection,
      );
      const createProjectResponse = await createTestProject(
        app,
        createProjectDtoMock,
        createUserResponse.token,
      );

      const createTaskResponse = await createTestTask(
        app,
        mockCreateTaskDto,
        createUserResponse.token,
        createProjectResponse._id,
      );

      const anotherUserResponse = await createTestUser(
        app,
        {
          ...createUserDtoMock,
          name: 'Another User',
          email: 'another@email.com',
        },
        connection,
      );

      const response = await request(app.getHttpServer())
        .put(
          `/projects/${createProjectResponse._id}/tasks/${createTaskResponse._id}`,
        )
        .set('Authorization', `Bearer ${anotherUserResponse.token}`)
        .send(mockUpdateTaskDto)
        .expect(403);

      expect(response.body).toEqual({
        statusCode: 403,
        message: 'Acesso negado para este projeto.',
        error: 'Forbidden',
      });
    });

    it('should not update a task that does not exist', async () => {
      const createUserResponse = await createTestUser(
        app,
        createUserDtoMock,
        connection,
      );
      const createProjectResponse = await createTestProject(
        app,
        createProjectDtoMock,
        createUserResponse.token,
      );

      const response = await request(app.getHttpServer())
        .put(
          `/projects/${createProjectResponse._id}/tasks/678f1a2b3c4d5e6f7a8b9c0d`,
        )
        .set('Authorization', `Bearer ${createUserResponse.token}`)
        .send(mockUpdateTaskDto)
        .expect(404);

      expect(response.body).toEqual({
        statusCode: 404,
        message: 'Tarefa não encontrada',
        error: 'Not Found',
      });
    });

    it('should not update a task with invalid data', async () => {
      const createUserResponse = await createTestUser(
        app,
        createUserDtoMock,
        connection,
      );
      const createProjectResponse = await createTestProject(
        app,
        createProjectDtoMock,
        createUserResponse.token,
      );

      const createTaskResponse = await createTestTask(
        app,
        mockCreateTaskDto,
        createUserResponse.token,
        createProjectResponse._id,
      );

      const invalidUpdateDto = { title: 123 };

      const response = await request(app.getHttpServer())
        .put(
          `/projects/${createProjectResponse._id}/tasks/${createTaskResponse._id}`,
        )
        .set('Authorization', `Bearer ${createUserResponse.token}`)
        .send(invalidUpdateDto)
        .expect(400);

      expect(response.body).toMatchObject({
        statusCode: 400,
        error: 'Bad Request',
        message: expect.arrayContaining(['O título deve ser uma string']),
      });
    });
  });

  describe('DELETE /projects/:id/tasks/:taskId', () => {
    it('should delete a task by id', async () => {
      const createUserResponse = await createTestUser(
        app,
        createUserDtoMock,
        connection,
      );
      const createProjectResponse = await createTestProject(
        app,
        createProjectDtoMock,
        createUserResponse.token,
      );

      const createTaskResponse = await createTestTask(
        app,
        mockCreateTaskDto,
        createUserResponse.token,
        createProjectResponse._id,
      );

      const response = await request(app.getHttpServer())
        .delete(
          `/projects/${createProjectResponse._id}/tasks/${createTaskResponse._id}`,
        )
        .set('Authorization', `Bearer ${createUserResponse.token}`)
        .expect(200);

      expect(response.body).toEqual({});
    });

    it('should not delete a task without authentication', async () => {
      const createUserResponse = await createTestUser(
        app,
        createUserDtoMock,
        connection,
      );
      const createProjectResponse = await createTestProject(
        app,
        createProjectDtoMock,
        createUserResponse.token,
      );

      const createTaskResponse = await createTestTask(
        app,
        mockCreateTaskDto,
        createUserResponse.token,
        createProjectResponse._id,
      );

      const response = await request(app.getHttpServer())
        .delete(
          `/projects/${createProjectResponse._id}/tasks/${createTaskResponse._id}`,
        )
        .expect(401);

      expect(response.body).toEqual({
        status: 401,
        message: 'Unauthorized',
      });
    });

    it('should not delete a task without access to the project', async () => {
      const createUserResponse = await createTestUser(
        app,
        createUserDtoMock,
        connection,
      );
      const createProjectResponse = await createTestProject(
        app,
        createProjectDtoMock,
        createUserResponse.token,
      );

      const createTaskResponse = await createTestTask(
        app,
        mockCreateTaskDto,
        createUserResponse.token,
        createProjectResponse._id,
      );

      const anotherUserResponse = await createTestUser(
        app,
        {
          ...createUserDtoMock,
          name: 'Another User',
          email: 'another@email.com',
        },
        connection,
      );

      const response = await request(app.getHttpServer())
        .delete(
          `/projects/${createProjectResponse._id}/tasks/${createTaskResponse._id}`,
        )
        .set('Authorization', `Bearer ${anotherUserResponse.token}`)
        .expect(403);

      expect(response.body).toEqual({
        statusCode: 403,
        message: 'Acesso negado para este projeto.',
        error: 'Forbidden',
      });
    });

    it('should not delete a task that does not exist', async () => {
      const createUserResponse = await createTestUser(
        app,
        createUserDtoMock,
        connection,
      );
      const createProjectResponse = await createTestProject(
        app,
        createProjectDtoMock,
        createUserResponse.token,
      );

      const response = await request(app.getHttpServer())
        .delete(
          `/projects/${createProjectResponse._id}/tasks/678f1a2b3c4d5e6f7a8b9c0d`,
        )
        .set('Authorization', `Bearer ${createUserResponse.token}`)
        .expect(404);

      expect(response.body).toEqual({
        statusCode: 404,
        message: 'Tarefa não encontrada',
        error: 'Not Found',
      });
    });
  });
});
```

tasks.mocks.ts:

```ts id="mock-tasks"
import { INestApplication } from "@nestjs/common";
import { CreateTaskDto } from "../../dto/create-task.dto";
import { UpdateTaskDto } from "../../dto/update-task.dto";
import request from "supertest";
import { Task, TaskStatus } from "../../entities/task.entity";
import { ListProjectDto } from "src/modules/projects/dto/list-project.dto";
import { Types } from "mongoose";

export const mockTaskModel = {
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn(),
  countDocuments: jest.fn(),
  exec: jest.fn(),
};

export const mockService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

export const mockTask: Task = {
  code: 1,
  title: 'Test Task',
  description: createDescriptionBuffer('This is a test task'),
  status: TaskStatus.NOT_STARTED,
  tags: ['tag1'],
  projectId: new Types.ObjectId('507f1f77bcf86cd799439011'),
};

export const mockTaskList: Task[] = [
  { ...mockTask, _id: new Types.ObjectId('507f1f77bcf86cd799439011') } as Task,
  { ...mockTask, code: 2, _id: new Types.ObjectId('607f1f77bcf86cd799439012') } as Task,
];

export const mockCreateTaskDto: CreateTaskDto = {
  title: 'Test Task',
  description: 'VGhpcyBpcyBhIHRlc3QgdGFzaw==', // Base64 for "This is a test task"
  tags: ['taskId-1', 'taskId-2']
};

export const mockUpdateTaskDto: UpdateTaskDto = {
  title: 'Updated Task',
  description: 'VGhpcyBpcyBhIHRlc3QgdGFzaw==', // Base64 for "This is an updated task"
  tags: ['updated-tag-1']
};

export const mockListProjectDto: ListProjectDto = {
  page: 1,
  limit: 10,
  keyword: undefined,
};

export const mockId = '507f1f77bcf86cd799439011';
export const mockProjectId = '607f1f77bcf86cd799439011';

export async function createTestTask(
  app: INestApplication, 
  createTaskDto: CreateTaskDto,
  jwtToken: string,
  projectId: string
): Promise<Task & { _id: string, createdAt: Date, updatedAt: Date }> {
  const response = await request(app.getHttpServer())
    .post(`/projects/${projectId}/tasks`)
    .set('Authorization', `Bearer ${jwtToken}`)
    .send(createTaskDto)
    .expect(201);

  expect(response.body).toMatchObject(createTaskDto);

  return response.body;
} 

export function createDescriptionBuffer(description: string): Buffer {
  const descriptionBuffer = Buffer.from(description, 'base64');
  return descriptionBuffer;
}
```
---
