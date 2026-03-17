import { INestApplication, ValidationPipe } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import mongoose, { Connection, mongo } from "mongoose";
import { CreateProjectDto } from "../../dto/create-project.dto";
import { Test, TestingModule } from "@nestjs/testing";
import { getConnectionToken, MongooseModule } from "@nestjs/mongoose";
import { AppModule } from "../../../../app.module";
import request from 'supertest';
import { CreateUserDto } from "src/modules/users/dto/create-user.dto";
import { ConfigModule } from "@nestjs/config";
import { createTestUser } from "../../../users/tests/e2e/users.e2e.spec";
import { UpdateProjectDto } from "../../dto/update-project.dto";

export async function createTestProject(
  app: INestApplication, 
  createProjectDto: CreateProjectDto,
  jwtToken: string,
) {
  const response = await request(app.getHttpServer())
    .post('/projects')
    .set('Authorization', `Bearer ${jwtToken}`)
    .send(createProjectDto)
    .expect(201);

  expect(response.body).toMatchObject({
    title: createProjectDto.title,
    description: createProjectDto.description,
  });

  return response.body;
}

describe('Projects Endpoints', () => {
  let app: INestApplication;
  let connection: Connection;
  let jwtService: JwtService;
  const createProjectDto: CreateProjectDto = {
    title: 'Projeto Teste',
    description: 'Descrição do projeto teste',
  }
  const updateProjectDto: UpdateProjectDto = {
    title: 'Projeto Teste Atualizado',
    description: 'Descrição atualizada do projeto teste',
  }
  const createUserDto: CreateUserDto = {
    name: 'Alex',
    email: 'alex@email.com',
    password: '123456',
  }

  beforeAll(async () => {
    const moduleTest: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true
        }),
        MongooseModule.forRoot(process.env.MONGODB_URI_TESTS || 'mongodb://localhost:27017/', {
          dbName: process.env.MONGODB_DB_NAME_TESTS || 'elucide-notes-tests'
        }),
        AppModule
      ]
    }).compile();

    app = moduleTest.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    )
    connection = moduleTest.get<Connection>(getConnectionToken())
    await app.init();

    jwtService = moduleTest.get(JwtService);
  })

  beforeEach(async () => {
    await connection.useDb(process.env.MONGODB_DB_NAME_TESTS || 'elucide-notes-tests').collection('projects').deleteMany({});
    await connection.useDb(process.env.MONGODB_DB_NAME_TESTS || 'elucide-notes-tests').collection('users').deleteMany({});
  })

  afterAll(async () => {
    await connection.useDb(process.env.MONGODB_DB_NAME_TESTS || 'elucide-notes-tests').dropDatabase();
    await connection.close();
    await app.close();
  });

  describe('GET /projects/my-projects', () => {
    it('should return ONLY projects that the logged user has access to', async () => {
      // 1. Criar Usuário A e seu Projeto
      const userA = await createTestUser(app, 
        { 
          name: 'User A', email: 'a@email.com', password: 'password' 
        },  
        connection
      );
      
      await request(app.getHttpServer())
        .post('/projects')
        .set('Authorization', `Bearer ${userA.token}`)
        .send({ title: 'Projeto do Usuario A' })
        .expect(201);

      // 2. Criar Usuário B e seu Projeto
      const userB = await createTestUser(app, 
        { 
          name: 'User B', email: 'b@email.com', password: 'password' 
        },  
        connection
      );
      
      await request(app.getHttpServer())
        .post('/projects')
        .set('Authorization', `Bearer ${userB.token}`)
        .send({ title: 'Projeto Secreto do B' })
        .expect(201);

      // 3. Usuário A tenta listar os projetos
      const listResponse = await request(app.getHttpServer())
        .get('/projects/my-projects')
        .set('Authorization', `Bearer ${userA.token}`) // Autenticado como A
        .expect(200);

      // 4. Asserts Críticos
      // Deve conter apenas 1 projeto (o dele)
      expect(listResponse.body.total).toBe(1);
      expect(listResponse.body.data[0].title).toBe('Projeto do Usuario A');
      
      // Garante que o projeto do Usuário B NÃO está na lista
      const titles = listResponse.body.data.map(p => p.title);
      expect(titles).not.toContain('Projeto Secreto do B');
    });

    it('should return an empty list if no projects exist', async () => {
      const userA = await createTestUser(app, 
        { 
          name: 'User A', email: 'a@email.com', password: 'password' 
        },  
        connection
      );
      
      const response = await request(app.getHttpServer())
        .get('/projects/my-projects')
        .set('Authorization', `Bearer ${userA.token}`)
        .expect(200);

      expect(response.body).toEqual({
        total: 0,
        data: [],
        page: 1,
        limit: 10
      });
    })
  })

  describe('GET /projects/my-projects/:id', () => {
    it('should return a project by ID', async () => {
      const user = await createTestUser(
        app, 
        { 
          name: 'User', email: 'user@email.com', password: 'password' 
        },  
        connection
      );

      const project = await request(app.getHttpServer())
        .post('/projects')
        .set('Authorization', `Bearer ${user.token}`)
        .send(createProjectDto)
        .expect(201);

      const response = await request(app.getHttpServer())
        .get(`/projects/my-projects/${project.body._id}`)
        .set('Authorization', `Bearer ${user.token}`)
        .expect(200);

      expect(response.body).toMatchObject({
        title: createProjectDto.title,
        description: createProjectDto.description,
      });
    })

    it('should return 404 if project is not found', async () => {
      const userA = await createTestUser(
        app, 
        { 
          name: 'User A', email: 'usera@email.com', password: 'password' 
        },  
        connection
      );

      const response = await request(app.getHttpServer())
        .get(`/projects/my-projects/698629ab9cc431a3880e15f8`) // ID aleatório que não existe
        .set('Authorization', `Bearer ${userA.token}`)
        .expect(404);
      
      expect(response.body).toEqual({
        statusCode: 404,
        message: 'Projeto não encontrado.',
        error: 'Not Found'
      });
    })

    it('should return 404 if project exists but user has no access', async () => {
      const userA = await createTestUser(
        app, 
        { 
          name: 'User A', email: 'usera@email.com', password: 'password' 
        },  
        connection
      );

      const userB = await createTestUser(
        app, 
        { 
          name: 'User B', email: 'userb@email.com', password: 'password' 
        },  
        connection
      );

      const project = await request(app.getHttpServer())
        .post('/projects')        
        .set('Authorization', `Bearer ${userB.token}`)
        .send(createProjectDto)
        .expect(201);

      const response = await request(app.getHttpServer())
        .get(`/projects/my-projects/${project.body._id}`)
        .set('Authorization', `Bearer ${userA.token}`) // User A tenta acessar projeto do User B
        .expect(404);
      
      expect(response.body).toEqual({
        statusCode: 404,
        message: 'Acesso negado para este projeto.',
        error: 'Not Found'
      });
    })

    it('should return 401 if user is not authenticated', async () => {
      const response = await request(app.getHttpServer())
        .get(`/projects/my-projects/698629ab9cc431a3880e15f8`)
        .expect(401);

      expect(response.body).toEqual({
        status: 401,
        message: 'Unauthorized'
      });
    })
  })

  describe('POST /projects', () => {
    it('should create a new project', async () => {
      const response = await createTestUser(app, createUserDto, connection);

      const projectResponse = await request(app.getHttpServer())
        .post('/projects')
        .set('Authorization', `Bearer ${response.token}`)
        .send(createProjectDto)
        .expect(201);

      expect(projectResponse.body).toMatchObject({
        title: createProjectDto.title,
        description: createProjectDto.description,
      });
    })

    it('should throw an error if user is not authenticated', async () => {
      const response = await request(app.getHttpServer())
        .post('/projects')
        .send(createProjectDto)
        .expect(401);

      expect(response.body).toEqual({
        status: 401,
        message: 'Unauthorized'
      });
    })

    it('should throw errors on invalid DTO fields', async () => {
      const projectEmptyDto = new CreateProjectDto();

      const response = await createTestUser(app, createUserDto, connection);

      const projectResponse = await request(app.getHttpServer())
        .post('/projects')
        .set('Authorization', `Bearer ${response.token}`)
        .send(projectEmptyDto)
        .expect(400);

      expect(projectResponse.body).toEqual({
        statusCode: 400,
        error: 'Bad Request',
        message: expect.arrayContaining([
          "o título do projeto deve ser uma string",
          "o título do projeto é obrigatório",
        ]),
      });
    })
  })

  describe('GET /projects', () => {
    it('should return all projects for an admin user', async () => {
      const adminUser = await createTestUser(
        app, 
        { 
          name: 'Admin User', email: 'admin@email.com', password: 'password'
        },  
        connection,
        'admin'
      );

      const otherUser = await createTestUser(
        app, { 
          name: 'Other User', email: 'other@email.com', password: 'password' 
        }, 
        connection
      );

      await request(app.getHttpServer())
        .post('/projects')
        .set('Authorization', `Bearer ${otherUser.token}`)
        .send({ title: 'Projeto de outro usuário' })
        .expect(201);

      const response = await request(app.getHttpServer())
        .get('/projects')
        .set('Authorization', `Bearer ${adminUser.token}`)
        .expect(200);

      expect(response.body.total).toBe(1);
      expect(response.body.data[0].title).toBe('Projeto de outro usuário');
    })

    it('should return all projects with pagination, sorting and filtering', async () => {
      const adminUser = await createTestUser(
        app, 
        { 
          name: 'Admin User', email: 'admin@email.com', password: 'password'
        }, 
        connection,
        'admin'
      );

      // Criar 15 projetos
      const projects: any = [];
      for (let i = 1; i <= 15; i++) {
        const index = i.toString().padStart(2, '0');
        projects.push({ title: `Projeto ${index}` });
      }

      await connection.useDb(process.env.MONGODB_DB_NAME_TESTS || 'elucide-notes-tests').collection('projects').insertMany(projects);

      // Listar com paginação (page 2, limit 5)
      const response = await request(app.getHttpServer())
        .get('/projects?page=2&limit=5&sortBy=title&sortOrder=-1&keyword=Projeto')
        .set('Authorization', `Bearer ${adminUser.token}`)
        .expect(200);

      expect(response.body.total).toBe(15);
      expect(response.body.data.length).toBe(5);
      expect(response.body.data[0].title).toBe('Projeto 10'); // Ordenação decrescente por título
    })

    it('should return 401 unauthorized for non-admin users', async () => {
      const regularUser = await createTestUser(
        app, 
        { 
          name: 'Regular User', email: 'regular@email.com', password: 'password' 
        }, 
        connection
      );

      const response = await request(app.getHttpServer())
        .get('/projects')
        .set('Authorization', `Bearer ${regularUser.token}`)
        .expect(401);

      expect(response.body).toEqual({
        statusCode: 401,
        error: 'Unauthorized',
        message: 'Unauthorized.'
      });
    })
  })

  describe('GET /projects/:id', () => {
    it('should return a project by ID for admin users', async () => {
      const adminUser = await createTestUser(
        app, 
        { 
          name: 'Admin User', email: 'admin@email.com', password: 'password'
        }, 
        connection,
        'admin'
      );

      const otherUser = await createTestUser(
        app, 
        { 
          name: 'Other User', email: 'other@email.com', password: 'password' 
        }, 
        connection
      );

      const project = await request(app.getHttpServer())
        .post('/projects')
        .set('Authorization', `Bearer ${otherUser.token}`)
        .send(createProjectDto)
        .expect(201);

      const response = await request(app.getHttpServer())
        .get(`/projects/${project.body._id}`)
        .set('Authorization', `Bearer ${adminUser.token}`)
        .expect(200);

      expect(response.body).toMatchObject({
        title: createProjectDto.title,
        description: createProjectDto.description,
      });
    })

    it('should return 404 if project is not found', async () => {
      const adminUser = await createTestUser(
        app, 
        { 
          name: 'Admin User', email: 'admin@email.com', password: 'password'
        }, 
        connection,
        'admin'
      )

      const response = await request(app.getHttpServer())
        .get(`/projects/698629ab9cc431a3880e15f8`)
        .set('Authorization', `Bearer ${adminUser.token}`)
        .expect(404);
      
      expect(response.body).toEqual({
        statusCode: 404,
        message: 'Projeto não encontrado.',
        error: 'Not Found'
      });
    })

    it('should return 401 if user is not authenticated', async () => {
      const response = await request(app.getHttpServer())
        .get(`/projects/698629ab9cc431a3880e15f8`)
        .expect(401);

      expect(response.body).toEqual({
        status: 401,
        message: 'Unauthorized'
      });
    })
  })

  describe('PUT /projects/:id', () => {
    it('should update a project when user has proper authorization', async () => {
      const user = await createTestUser(app, createUserDto, connection)

      const project = await createTestProject(app, createProjectDto, user.token)

      const response = await request(app.getHttpServer())
        .put(`/projects/${project._id}`)
        .set('Authorization', `Bearer ${user.token}`)
        .send(updateProjectDto)
        .expect(200);

      expect(response.body).toMatchObject({
        title: updateProjectDto.title,
        description: updateProjectDto.description,
      })
    })

    it('should update a project when user is admin', async () => {
      const adminUser = await createTestUser(
        app, 
        {
          name: 'Admin User', email: 'admin@email.com', password: 'password'
        },
        connection,
        'admin'
      );

      const otherUser = await createTestUser(
        app, 
        { 
          name: 'Other User', email: 'other@email.com', password: 'password' 
        }, 
        connection,
      );

      const project = await createTestProject(app, createProjectDto, otherUser.token);

      const response = await request(app.getHttpServer())
        .put(`/projects/${project._id}`)
        .set('Authorization', `Bearer ${adminUser.token}`)
        .send(updateProjectDto)
        .expect(200);

      expect(response.body).toMatchObject({
        title: updateProjectDto.title,
        description: updateProjectDto.description,
      })
    })

    it('should return 404 if project is not found', async () => {
      const user = await createTestUser(app, createUserDto, connection);

      const response = await request(app.getHttpServer())
        .put(`/projects/698629ab9cc431a3880e15f8`)
        .set('Authorization', `Bearer ${user.token}`)
        .send(updateProjectDto)
        .expect(404);

      expect(response.body).toEqual({
        statusCode: 404,
        message: 'Projeto não encontrado.',
        error: 'Not Found'
      });
    })

    it('should return 401 if user not have access to the project', async () => {
      const userA = await createTestUser(
        app, 
        { 
          name: 'User A', email: 'a@email.com', password: 'password' 
        },  
        connection
      );

      const userB = await createTestUser(
        app, 
        { 
          name: 'User B', email: 'b@email.com', password: 'password'
        }, 
        connection
      );

      const project = await createTestProject(app, createProjectDto, userB.token);

      const response = await request(app.getHttpServer())
        .put(`/projects/${project._id}`)
        .set('Authorization', `Bearer ${userA.token}`)
        .send(updateProjectDto)
        .expect(404);

      expect(response.body).toEqual({
        statusCode: 404,
        message: 'Acesso negado para este projeto.',
        error: 'Not Found'
      });
    })

    it('should return 401 if user is not authenticated', async () => {
      const response = await request(app.getHttpServer())
        .put(`/projects/698629ab9cc431a3880e15f8`)
        .send(updateProjectDto)
        .expect(401);

      expect(response.body).toEqual({
        status: 401,
        message: 'Unauthorized'
      });
    })
  })

  describe('DELETE /projects/:id', () => {
    it('should delete a project when user has proper authorization', async () => {
      const user = await createTestUser(app, createUserDto, connection)

      const project = await createTestProject(app, createProjectDto, user.token)

      const response = await request(app.getHttpServer())
        .delete(`/projects/${project._id}`)
        .set('Authorization', `Bearer ${user.token}`)
        .expect(200);

      expect(response.text).toBe('Projeto deletado com sucesso.');
    })

    it('should delete a project when user is admin', async () => {
      const adminUser = await createTestUser(
        app,
        {
          name: 'Admin User', email: 'admin@email.com', password: 'password'
        },
        connection,
        'admin'
      );

      const otherUser = await createTestUser(
        app,
        {
          name: 'Other User', email: 'other@email.com', password: 'password'
        },
        connection,
      );

      const project = await createTestProject(app, createProjectDto, otherUser.token);

      const response = await request(app.getHttpServer())
        .delete(`/projects/${project._id}`)
        .set('Authorization', `Bearer ${adminUser.token}`)
        .expect(200);

      expect(response.text).toBe('Projeto deletado com sucesso.');
    })

    it('should return 404 if project is not found', async () => {
      const user = await createTestUser(app, createUserDto, connection);

      const response = await request(app.getHttpServer())
        .delete(`/projects/698629ab9cc431a3880e15f8`)
        .set('Authorization', `Bearer ${user.token}`)
        .expect(404);

      expect(response.body).toEqual({
        statusCode: 404,
        message: 'Projeto não encontrado.',
        error: 'Not Found'
      });
    })
  })
})