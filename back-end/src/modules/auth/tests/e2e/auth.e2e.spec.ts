import { INestApplication, ValidationPipe } from "@nestjs/common";
import { getConnectionToken, MongooseModule } from "@nestjs/mongoose";
import { Test, TestingModule } from "@nestjs/testing";
import { Connection } from "mongoose";
import { AppModule } from "../../../../app.module";
import { CreateUserDto } from "../../../users/dto/create-user.dto";
import request from 'supertest';
import { ConfigModule } from "@nestjs/config";

describe('Auth Endpoints', () => {
  let app: INestApplication;
  let connection: Connection;
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
    }).compile()

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
    await connection.useDb('elucide-notes-tests').collection('users').deleteMany({});
  })
  
  afterAll(async () => {
    await connection.useDb('elucide-notes-tests').dropDatabase();
    await connection.close();
    await app.close();
  });

  it('should be defined', () => {
    expect(app).toBeDefined();
  })

  describe('POST /auth', () => {
    it('should login a user', async () => {
      await request(app.getHttpServer())
        .post('/users')
        .send(createUserDto)
        .expect(201);

      const response = await request(app.getHttpServer())
        .post('/auth')
        .send({
          email: createUserDto.email,
          password: createUserDto.password
        })
        .expect(201);

      expect(response.text).toBe('Login successful');
      expect(response.get('Set-Cookie')).toBeDefined()
    })

    it('should throw an error if user email not found', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth')
        .send({
          email: createUserDto.email,
          password: createUserDto.password
        })
        .expect(404);

      expect(response.body).toEqual({
        statusCode: 404,
        message: 'Usuário não encontrado.',
        error: 'Not Found'
      });
    })

    it('should throw an error if password is incorrect', async () => {
      await request(app.getHttpServer())
        .post('/users')
        .send(createUserDto)
        .expect(201);
      
      const response = await request(app.getHttpServer())
        .post('/auth')
        .send({
          email: createUserDto.email,
          password: 'wrong-password'
        })
        .expect(400);

      expect(response.body).toEqual({
        statusCode: 400,
        message: 'Senha incorreta.',
        error: 'Bad Request'
      });
    })

    it('should throw errors on invalid DTO fields', async () => {
      const userEmptyDto = new CreateUserDto();

      const response = await request(app.getHttpServer())
        .post('/auth')
        .send(userEmptyDto)
        .expect(400);
      
      expect(response.body).toEqual({
        statusCode: 400,
        error: 'Bad Request',
        message: expect.arrayContaining([
          'O Email é obrigatório.',
          'Formato de Email inválido.',
          'A Senha é obrigatória.',
          'A Senha deve ser uma string.'
        ])
      });
    })
  })

  describe('GET /auth', () => {
    it('should logout a user', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/logout')
        .expect(200);

      expect(response.text).toBe('Logout successful');
      expect(response.get('Set-Cookie')).toBeDefined()
    })
  })
})