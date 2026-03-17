import { AuthUserType } from "src/utils/decorators/auth-user.decorator"
import { CreateUserDto } from "../../dto/create-user.dto"
import { UpdateUserDto } from "../../dto/update-user.dto"

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
  email: 'alex@email',
  cpf: '12345678909',
  phone: '123456789',
  createdAt: new Date(),
  updatedAt: new Date()
}

export const createUserDtoMock: CreateUserDto = {
  name: 'Alex',
  email: 'alex@email',
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