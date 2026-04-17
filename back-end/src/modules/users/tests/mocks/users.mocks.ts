import { AuthUserType } from "src/utils/decorators/auth-user.decorator"
import { CreateUserDto } from "../../dto/create-user.dto"
import { UpdateUserDto } from "../../dto/update-user.dto"
import { INestApplication } from "@nestjs/common"
import request from "supertest"
import { Connection, Types } from "mongoose"

export const mockUserService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
}

export const mockUserModel = {
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn()
}

export const userMock = {
  _id: '1',
  name: 'Alex',
  email: 'alex@email.com',
  cpf: '12345678909',
  phone: '123456789',
  createdAt: new Date(),
  updatedAt: new Date()
}

export const createUserDtoMock: CreateUserDto = {
  name: 'Alex',
  email: 'alex@email.com',
  password: '123456',
}

export const updateUserDtoMock: UpdateUserDto = {
  name: 'Alex Silva',
  password: 'new password'
}

export const authUserMock: AuthUserType = {
  sub: '1',
  username: 'Alex',
  role: 'user'
}

export async function createTestUser(
  app: INestApplication, 
  createUserDto: CreateUserDto, 
  dbConnection: Connection,
  role: 'admin' | 'user' = 'user',
): Promise<{ token: string, user: typeof userMock }> {
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