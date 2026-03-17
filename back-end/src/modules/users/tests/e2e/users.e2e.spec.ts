import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Connection, Types } from "mongoose";
import { CreateUserDto } from "../../dto/create-user.dto";
import { UpdateUserDto } from "../../dto/update-user.dto";
import { Test, TestingModule } from "@nestjs/testing";
import { getConnectionToken, MongooseModule } from "@nestjs/mongoose";
import { AppModule } from "../../../../app.module";
import request from 'supertest';
import { ConfigModule } from "@nestjs/config";

export async function createTestUser(
  app: INestApplication, 
  createUserDto: CreateUserDto, 
  dbConnection: Connection,
  role: string = 'user',
) {
  const response = await request(app.getHttpServer())
    .post('/users')
    .send(createUserDto)
    .expect(201);

  expect(response.body).toMatchObject({
    name: createUserDto.name,
    email: createUserDto.email,
  });

  if (role === 'admin') {
    await dbConnection.useDb(process.env.MONGODB_DB_NAME_TESTS || 'elucide-notes-tests').collection('users').updateOne(
      { _id: new Types.ObjectId(response.body._id) },
      { $set: { role: 'admin' } }
    );
  }

  const login = await request(app.getHttpServer())
    .post('/auth')
    .send({ email: createUserDto.email, password: createUserDto.password })
    .expect(201);
  
  return {
    token: login.get('Set-Cookie')![0].split(';')[0].split('=')[1],
    user: response.body,
  };
}

describe('Users Endpoints', () => {
  let app: INestApplication;
  let connection: Connection;
  const createUserDto: CreateUserDto = {
    name: 'Alex',
    email: 'alex@email.com',
    password: '123456',
  }

  const updateUserDto: UpdateUserDto = {
    name: 'Alex Silva'
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
  })

  beforeEach(async () => {
    await connection.useDb(process.env.MONGODB_DB_NAME_TESTS || 'elucide-notes-tests').collection('users').deleteMany({});
  })
  
  afterAll(async () => {
    await connection.useDb(process.env.MONGODB_DB_NAME_TESTS || 'elucide-notes-tests').dropDatabase();
    await connection.close();
    await app.close();
  });

  describe('POST /users', () => {
    it('should create a user', async () => {
      const response = await createTestUser(app, createUserDto, connection);

      expect(response.user).toMatchObject({
        name: createUserDto.name,
        email: createUserDto.email,
      })
    })

    it('should fail when trying to create a user with an already registered email', async () => {
      await createTestUser(app, createUserDto, connection);

      const response = await request(app.getHttpServer())
        .post('/users')
        .send(createUserDto)
        .expect(400);

      expect(response.body).toMatchObject({
        statusCode: 400,
        message: 'Email já cadastrado.',
        error: 'Bad Request'
      })
    })

    it('Should throw erros on invalid DTO fields', async () => {
      const userEmptyDto = new CreateUserDto();

      const response = await request(app.getHttpServer())
        .post('/users')
        .send(userEmptyDto)
        .expect(400);

      expect(response.body).toMatchObject({
        statusCode: 400,
        error: 'Bad Request',
        message: expect.arrayContaining([
          "O nome deve ser uma string.",
          "O noame deve ser informado.",
          "O email deve ser um endereço de email válido.",
          "O email deve ser informado.",
          "A senha deve ser uma string.",
          "A senha deve ser informada.",
        ])
      })
    })
  })

  describe('GET /users', () => {
    it('should return an array of users', async () => {
      const { token } = await createTestUser(app, createUserDto, connection, 'admin');
      const response = await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    })

    it('should throw an error if token is invalid', async () => {
      await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer invalid-token`)
        .expect(401)
    })
  })

  describe('GET /users/:id', () => {
    it('should return a user', async () => {
      const createUser = await createTestUser(app, createUserDto, connection, 'admin'); 

      const response = await request(app.getHttpServer())
        .get('/users/' + createUser.user._id)
        .set('Authorization', `Bearer ${createUser.token}`)
        .expect(200);

      expect(response.body).toMatchObject({
        name: createUserDto.name,
        email: createUserDto.email,
      });
    })

    it('should throw an error if user not found', async () => {
      const createUser = await createTestUser(app, createUserDto, connection, 'admin'); 
      
      await request(app.getHttpServer())
        .get('/users/68823c31515ace1cb0e5c748')
        .set('Authorization', `Bearer ${createUser.token}`)
        .expect(404)
    })

    it('should throw an error if token is invalid', async () => {
      await request(app.getHttpServer())
        .get('/users/68823c31515ace1cb0e5c748')
        .set('Authorization', `Bearer invalid-token`)
        .expect(401)
    })
  })

  describe('PUT /users/:id', () => {
    it('should update a user', async () => {
      const createUser = await createTestUser(app, createUserDto, connection, 'admin');
      
      const response = await request(app.getHttpServer())
        .put('/users/' + createUser.user._id)
        .set('Authorization', `Bearer ${createUser.token}`)
        .send(updateUserDto)
        .expect(200);

      expect(response.body).toMatchObject({
        name: updateUserDto.name
      })
    })

    it('should throw an error if user not found', async () => {
      const createUser = await createTestUser(app, createUserDto, connection, 'admin');
      
      await request(app.getHttpServer())
        .put('/users/68823c31515ace1cb0e5c748')
        .set('Authorization', `Bearer ${createUser.token}`)
        .send(updateUserDto)
        .expect(404);
    })

    it('should throw an error if token is invalid', async () => {
      await request(app.getHttpServer())
        .put('/users/68823c31515ace1cb0e5c748')
        .set('Authorization', `Bearer invalid-token`)
        .send(updateUserDto)
        .expect(401);
    })
  })

  describe('DELETE /users/:id', () => {
    it('should delete a user', async () => {
      const createUser = await createTestUser(app, createUserDto, connection, 'admin');

      const response = await request(app.getHttpServer())
        .delete('/users/' + createUser.user._id)
        .set('Authorization', `Bearer ${createUser.token}`)
        .expect(200);

      expect(response.text).toBe('Usuário deletado com sucesso.');
    })

    it('should throw an error if user not found', async () => {
      const createUser = await createTestUser(app, createUserDto, connection, 'admin');

      await request(app.getHttpServer())
        .delete('/users/68823c31515ace1cb0e5c748')
        .set('Authorization', `Bearer ${createUser.token}`)
        .expect(404);
    })

    it('should throw an error if token is invalid', async () => {
      await request(app.getHttpServer())
        .delete('/users/68823c31515ace1cb0e5c748')
        .set('Authorization', `Bearer invalid-token`)
        .expect(401);
    })
  })

  describe('GET /users/me', () => {
    it('should return a user', async () => {
      const createUser = await createTestUser(app, createUserDto, connection);

      const response = await request(app.getHttpServer())
        .get('/users/me')
        // .set('Cookie', login.get('Set-Cookie')![0])
        .set('Authorization', `Bearer ${createUser.token}`)
        .expect(200);

      expect(response.body).toMatchObject({
        name: createUserDto.name,
        email: createUserDto.email,
      });
    })

    it('should throw an error if token is invalid', async () => {
      const response = await request(app.getHttpServer())
        .get('/users/me')
        .set('Authorization', `Bearer invalid-token`)
        .expect(401)

      expect(response.body).toEqual({
        status: 401,
        message: 'Unauthorized',
      });
    })
  })

  describe('PUT /users/me', () => {
    it('should update a user', async () => {
      const createUser = await createTestUser(app, createUserDto, connection);

      const response = await request(app.getHttpServer())
        .put('/users/me')
        .set('Authorization', `Bearer ${createUser.token}`)
        .send(updateUserDto)
        .expect(200);
      
      expect(response.body).toMatchObject({
        name: updateUserDto.name
      })
    })

    it('Should throw an error if token is invalid', async () => {
      const response = await request(app.getHttpServer())
        .put('/users/me')
        .set('Authorization', `Bearer invalid-token`)
        .expect(401)

      expect(response.body).toEqual({
        status: 401,
        message: 'Unauthorized',
      });
    })
  })
})