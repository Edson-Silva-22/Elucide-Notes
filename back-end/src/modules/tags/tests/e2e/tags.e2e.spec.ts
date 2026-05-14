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
import { createUserDtoMock } from '../../../users/tests/mocks/users.mocks';
import request from 'supertest';
import {
  mockCreateTagDto,
  createTestTag,
  mockUpdateTagDto,
  mockCreateDuplicateTagDto,
} from '../mocks/tags.mocks';

describe('Tags Endpoints', () => {
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
      .collection('tags')
      .deleteMany({});
  });

  afterAll(async () => {
    await connection
      .useDb(process.env.MONGODB_DB_NAME_TESTS || 'elucide-notes-tests')
      .dropDatabase();
    await connection.close();
    await app.close();
  });

  describe('POST /projects/:id/tags', () => {
    it('should create a new tag for a project', async () => {
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

      const createTagResponse = await createTestTag(
        app,
        mockCreateTagDto,
        createUserResponse.token,
        createProjectResponse._id,
      );

      expect(createTagResponse).toMatchObject(mockCreateTagDto);
    });

    it('should not create a tag with a duplicate title in the same project', async () => {
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

      await createTestTag(
        app,
        mockCreateTagDto,
        createUserResponse.token,
        createProjectResponse._id,
      );

      const response = await request(app.getHttpServer())
        .post(`/projects/${createProjectResponse._id}/tags`)
        .set('Authorization', `Bearer ${createUserResponse.token}`)
        .send(mockCreateDuplicateTagDto)
        .expect(409);

      expect(response.body).toEqual({
        statusCode: 409,
        message: 'Já existe uma tag com este título neste projeto',
        error: 'Conflict',
      });
    });

    it('should allow creating a tag with a title of a deleted tag', async () => {
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

      const createTagResponse = await createTestTag(
        app,
        mockCreateTagDto,
        createUserResponse.token,
        createProjectResponse._id,
      );

      await request(app.getHttpServer())
        .delete(`/projects/${createProjectResponse._id}/tags/${createTagResponse._id}`)
        .set('Authorization', `Bearer ${createUserResponse.token}`)
        .expect(200);

      const recreateResponse = await request(app.getHttpServer())
        .post(`/projects/${createProjectResponse._id}/tags`)
        .set('Authorization', `Bearer ${createUserResponse.token}`)
        .send(mockCreateTagDto)
        .expect(201);

      expect(recreateResponse.body).toMatchObject(mockCreateTagDto);
    });

    it('should not create a tag with invalid data', async () => {
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

      const invalidTagDto = {};

      const response = await request(app.getHttpServer())
        .post(`/projects/${createProjectResponse._id}/tags`)
        .set('Authorization', `Bearer ${createUserResponse.token}`)
        .send(invalidTagDto)
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

    it('should not create a tag without authentication', async () => {
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
        .post(`/projects/${createProjectResponse._id}/tags`)
        .send(mockCreateTagDto)
        .expect(401);

      expect(response.body).toEqual({
        status: 401,
        message: 'Unauthorized',
      });
    });

    it('should not create a tag without access to the project', async () => {
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
        .post(`/projects/${createProjectResponse._id}/tags`)
        .set('Authorization', `Bearer ${anotherUserResponse.token}`)
        .send(mockCreateTagDto)
        .expect(403);

      expect(response.body).toEqual({
        statusCode: 403,
        message: 'Acesso negado para este projeto.',
        error: 'Forbidden',
      });
    });
  });

  describe('GET /projects/:id/tags', () => {
    it('should get all tags from a project', async () => {
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

      await createTestTag(
        app,
        mockCreateTagDto,
        createUserResponse.token,
        createProjectResponse._id,
      );

      const anotherTagDto = { ...mockCreateTagDto, title: 'Another Tag' };

      await createTestTag(
        app,
        anotherTagDto,
        createUserResponse.token,
        createProjectResponse._id,
      );

      const response = await request(app.getHttpServer())
        .get(`/projects/${createProjectResponse._id}/tags`)
        .set('Authorization', `Bearer ${createUserResponse.token}`)
        .expect(200);
        
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0]).toMatchObject(mockCreateTagDto);
      expect(response.body.data[1]).toMatchObject(anotherTagDto);
    });

    it('should get all tags from a project with pagination and keyword search', async () => {
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

      await createTestTag(
        app,
        mockCreateTagDto,
        createUserResponse.token,
        createProjectResponse._id,
      );

      const anotherTagDto = { ...mockCreateTagDto, title: 'Another Tag' };

      await createTestTag(
        app,
        anotherTagDto,
        createUserResponse.token,
        createProjectResponse._id,
      );

      const response = await request(app.getHttpServer())
        .get(
          `/projects/${createProjectResponse._id}/tags?keyword=Test&page=1&limit=10`,
        )
        .set('Authorization', `Bearer ${createUserResponse.token}`)
        .expect(200);

      expect(response.body).toMatchObject({
        total: 1,
        data: [mockCreateTagDto],
        page: 1,
        limit: 10,
      });
    });

    it('should not get tags without authentication', async () => {
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
        .get(`/projects/${createProjectResponse._id}/tags`)
        .expect(401);

      expect(response.body).toEqual({
        status: 401,
        message: 'Unauthorized',
      });
    });

    it('should not get tags without access to the project', async () => {
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
        .get(`/projects/${createProjectResponse._id}/tags`)
        .set('Authorization', `Bearer ${anotherUserResponse.token}`)
        .expect(403);

      expect(response.body).toEqual({
        statusCode: 403,
        message: 'Acesso negado para este projeto.',
        error: 'Forbidden',
      });
    });

    it('should not list deleted tags', async () => {
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

      const createTagResponse = await createTestTag(
        app,
        mockCreateTagDto,
        createUserResponse.token,
        createProjectResponse._id,
      );

      await request(app.getHttpServer())
        .delete(`/projects/${createProjectResponse._id}/tags/${createTagResponse._id}`)
        .set('Authorization', `Bearer ${createUserResponse.token}`)
        .expect(200);

      const response = await request(app.getHttpServer())
        .get(`/projects/${createProjectResponse._id}/tags`)
        .set('Authorization', `Bearer ${createUserResponse.token}`)
        .expect(200);

      expect(response.body.data).toHaveLength(0);
      expect(response.body.total).toBe(0);
    });
  });

  describe('GET /projects/:id/tags/:tagId', () => {
    it('should get a tag by id', async () => {
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

      const createTagResponse = await createTestTag(
        app,
        mockCreateTagDto,
        createUserResponse.token,
        createProjectResponse._id,
      );

      const response = await request(app.getHttpServer())
        .get(
          `/projects/${createProjectResponse._id}/tags/${createTagResponse._id}`,
        )
        .set('Authorization', `Bearer ${createUserResponse.token}`)
        .expect(200);

      expect(response.body).toMatchObject(mockCreateTagDto);
    });

    it('should not get a tag without authentication', async () => {
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

      const createTagResponse = await createTestTag(
        app,
        mockCreateTagDto,
        createUserResponse.token,
        createProjectResponse._id,
      );

      const response = await request(app.getHttpServer())
        .get(
          `/projects/${createProjectResponse._id}/tags/${createTagResponse._id}`,
        )
        .expect(401);

      expect(response.body).toEqual({
        status: 401,
        message: 'Unauthorized',
      });
    });

    it('should not get a tag without access to the project', async () => {
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

      const createTagResponse = await createTestTag(
        app,
        mockCreateTagDto,
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
          `/projects/${createProjectResponse._id}/tags/${createTagResponse._id}`,
        )
        .set('Authorization', `Bearer ${anotherUserResponse.token}`)
        .expect(403);

      expect(response.body).toEqual({
        statusCode: 403,
        message: 'Acesso negado para este projeto.',
        error: 'Forbidden',
      });
    });

    it('should not get a tag that does not exist', async () => {
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
          `/projects/${createProjectResponse._id}/tags/678f1a2b3c4d5e6f7a8b9c0d`,
        )
        .set('Authorization', `Bearer ${createUserResponse.token}`)
        .expect(409);

      expect(response.body).toEqual({
        statusCode: 409,
        message: 'Tag não encontrada',
        error: 'Conflict',
      });
    });

    it('should not get a deleted tag', async () => {
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

      const createTagResponse = await createTestTag(
        app,
        mockCreateTagDto,
        createUserResponse.token,
        createProjectResponse._id,
      );

      await request(app.getHttpServer())
        .delete(`/projects/${createProjectResponse._id}/tags/${createTagResponse._id}`)
        .set('Authorization', `Bearer ${createUserResponse.token}`)
        .expect(200);

      const response = await request(app.getHttpServer())
        .get(`/projects/${createProjectResponse._id}/tags/${createTagResponse._id}`)
        .set('Authorization', `Bearer ${createUserResponse.token}`)
        .expect(409);

      expect(response.body).toEqual({
        statusCode: 409,
        message: 'Tag não encontrada',
        error: 'Conflict',
      });
    });
  });

  describe('PUT /projects/:id/tags/:tagId', () => {
    it('should update a tag by id', async () => {
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

      const createTagResponse = await createTestTag(
        app,
        mockCreateTagDto,
        createUserResponse.token,
        createProjectResponse._id,
      );

      const response = await request(app.getHttpServer())
        .put(
          `/projects/${createProjectResponse._id}/tags/${createTagResponse._id}`,
        )
        .set('Authorization', `Bearer ${createUserResponse.token}`)
        .send(mockUpdateTagDto)
        .expect(200);

      expect(response.body).toMatchObject(mockUpdateTagDto);
    });

    it('should not update a tag without authentication', async () => {
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

      const createTagResponse = await createTestTag(
        app,
        mockCreateTagDto,
        createUserResponse.token,
        createProjectResponse._id,
      );

      const response = await request(app.getHttpServer())
        .put(
          `/projects/${createProjectResponse._id}/tags/${createTagResponse._id}`,
        )
        .send(mockUpdateTagDto)
        .expect(401);

      expect(response.body).toEqual({
        status: 401,
        message: 'Unauthorized',
      });
    });

    it('should not update a tag without access to the project', async () => {
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

      const createTagResponse = await createTestTag(
        app,
        mockCreateTagDto,
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
          `/projects/${createProjectResponse._id}/tags/${createTagResponse._id}`,
        )
        .set('Authorization', `Bearer ${anotherUserResponse.token}`)
        .send(mockUpdateTagDto)
        .expect(403);

      expect(response.body).toEqual({
        statusCode: 403,
        message: 'Acesso negado para este projeto.',
        error: 'Forbidden',
      });
    });

    it('should not update a tag that does not exist', async () => {
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
          `/projects/${createProjectResponse._id}/tags/678f1a2b3c4d5e6f7a8b9c0d`,
        )
        .set('Authorization', `Bearer ${createUserResponse.token}`)
        .send(mockUpdateTagDto)
        .expect(409);

      expect(response.body).toEqual({
        statusCode: 409,
        message: 'Tag não encontrada',
        error: 'Conflict',
      });
    });

    it('should not update a tag with invalid data', async () => {
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

      const createTagResponse = await createTestTag(
        app,
        mockCreateTagDto,
        createUserResponse.token,
        createProjectResponse._id,
      );

      const invalidUpdateDto = { title: 123 };

      const response = await request(app.getHttpServer())
        .put(
          `/projects/${createProjectResponse._id}/tags/${createTagResponse._id}`,
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

    it('should not update a tag with a duplicate title in the same project', async () => {
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

      await createTestTag(
        app,
        mockCreateTagDto,
        createUserResponse.token,
        createProjectResponse._id,
      );

      const secondTag = await createTestTag(
        app,
        { ...mockCreateTagDto, title: 'Second Tag' },
        createUserResponse.token,
        createProjectResponse._id,
      );

      const response = await request(app.getHttpServer())
        .put(`/projects/${createProjectResponse._id}/tags/${secondTag._id}`)
        .set('Authorization', `Bearer ${createUserResponse.token}`)
        .send({ title: mockCreateTagDto.title })
        .expect(409);

      expect(response.body).toEqual({
        statusCode: 409,
        message: 'Já existe uma tag com este título neste projeto',
        error: 'Conflict',
      });
    });

    it('should not update a deleted tag', async () => {
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

      const createTagResponse = await createTestTag(
        app,
        mockCreateTagDto,
        createUserResponse.token,
        createProjectResponse._id,
      );

      await request(app.getHttpServer())
        .delete(`/projects/${createProjectResponse._id}/tags/${createTagResponse._id}`)
        .set('Authorization', `Bearer ${createUserResponse.token}`)
        .expect(200);

      const response = await request(app.getHttpServer())
        .put(`/projects/${createProjectResponse._id}/tags/${createTagResponse._id}`)
        .set('Authorization', `Bearer ${createUserResponse.token}`)
        .send(mockUpdateTagDto)
        .expect(409);

      expect(response.body).toEqual({
        statusCode: 409,
        message: 'Tag não encontrada',
        error: 'Conflict',
      });
    });
  });

  describe('DELETE /projects/:id/tags/:tagId', () => {
    it('should soft delete a tag by id', async () => {
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

      const createTagResponse = await createTestTag(
        app,
        mockCreateTagDto,
        createUserResponse.token,
        createProjectResponse._id,
      );

      const response = await request(app.getHttpServer())
        .delete(
          `/projects/${createProjectResponse._id}/tags/${createTagResponse._id}`,
        )
        .set('Authorization', `Bearer ${createUserResponse.token}`)
        .expect(200);

      expect(response.body).toEqual({});

      const deletedTag = await connection
        .useDb(process.env.MONGODB_DB_NAME_TESTS || 'elucide-notes-tests')
        .collection('tags')
        .findOne({ _id: new connection.base.Types.ObjectId(createTagResponse._id) });
      expect(deletedTag?.active).toBe(false);
    });

    it('should not delete a tag without authentication', async () => {
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

      const createTagResponse = await createTestTag(
        app,
        mockCreateTagDto,
        createUserResponse.token,
        createProjectResponse._id,
      );

      const response = await request(app.getHttpServer())
        .delete(
          `/projects/${createProjectResponse._id}/tags/${createTagResponse._id}`,
        )
        .expect(401);

      expect(response.body).toEqual({
        status: 401,
        message: 'Unauthorized',
      });
    });

    it('should not delete a tag without access to the project', async () => {
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

      const createTagResponse = await createTestTag(
        app,
        mockCreateTagDto,
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
          `/projects/${createProjectResponse._id}/tags/${createTagResponse._id}`,
        )
        .set('Authorization', `Bearer ${anotherUserResponse.token}`)
        .expect(403);

      expect(response.body).toEqual({
        statusCode: 403,
        message: 'Acesso negado para este projeto.',
        error: 'Forbidden',
      });
    });

    it('should not delete a tag that does not exist', async () => {
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
          `/projects/${createProjectResponse._id}/tags/678f1a2b3c4d5e6f7a8b9c0d`,
        )
        .set('Authorization', `Bearer ${createUserResponse.token}`)
        .expect(409);

      expect(response.body).toEqual({
        statusCode: 409,
        message: 'Tag não encontrada',
        error: 'Conflict',
      });
    });
  });
});
