import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../../users.service';
import { getModelToken } from '@nestjs/mongoose';
import { User } from '../../entities/user.entity';
import * as bcrypt from 'bcrypt';
import { BadRequestException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { Model } from 'mongoose';
import { createUserDtoMock, mockUserModel, updateUserDtoMock, userMock } from '../mocks/users.mocks';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
}));

describe('UsersService', () => {
  let service: UsersService;
  let userModel: Model<User>;

  beforeAll( async () => {
    // Criar um módulo de teste isolado, simulando o ambiente real de injeção de dependências do NestJS
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        }
      ]
    }).compile();

    service = module.get<UsersService>(UsersService);
    userModel = module.get<Model<User>>(getModelToken(User.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Create Method', () => {
    const hashedPassword = 'hashedPassword';

    it('should create a new user', async () => {
      (userModel.findOne as jest.Mock).mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      mockUserModel.create.mockResolvedValue({
        ...createUserDtoMock, 
        password: hashedPassword,
        toObject: jest.fn().mockReturnValue({
          name: createUserDtoMock.name,
          email: createUserDtoMock.email
        }),
      })

      const result = await service.create(createUserDtoMock);

      expect(mockUserModel.findOne).toHaveBeenCalledTimes(1)
      expect(mockUserModel.findOne).toHaveBeenCalledWith({ email: createUserDtoMock.email })
      
      expect(mockUserModel.create).toHaveBeenCalledTimes(1)
      expect(mockUserModel.create).toHaveBeenCalledWith({...createUserDtoMock, password: hashedPassword})

      expect(result).toEqual({
        name: createUserDtoMock.name,
        email: createUserDtoMock.email
      })
    })

    it('should throw an error if email already exists', async () => {
      mockUserModel.findOne.mockResolvedValue(userMock);

      await expect(service.create(createUserDtoMock)).rejects.toThrow(BadRequestException)

      expect(mockUserModel.findOne).toHaveBeenCalledTimes(1)
      expect(mockUserModel.findOne).toHaveBeenCalledWith({ email: createUserDtoMock.email })
    })

    it('should handle internal server error', async () => {
      mockUserModel.findOne.mockRejectedValue(new InternalServerErrorException('Internal Server Error'));

      await expect(service.create(createUserDtoMock)).rejects.toThrow(InternalServerErrorException)

      expect(mockUserModel.findOne).toHaveBeenCalledTimes(1)
      expect(mockUserModel.findOne).toHaveBeenCalledWith({ email: createUserDtoMock.email })
    })
  })

  describe('FindAll Method', () => {
    it('should return an array of users', async () => {
      mockUserModel.find.mockReturnValue({
        select: jest.fn().mockResolvedValue([userMock])
      });

      const result = await service.findAll();

      expect(mockUserModel.find).toHaveBeenCalledTimes(1)
      expect(mockUserModel.find).toHaveBeenCalledWith()
      expect(result).toEqual([userMock])
    })

    it('should handle internal server error', async () => {
      mockUserModel.find.mockImplementation(() => ({
        select: jest.fn().mockRejectedValue(new InternalServerErrorException('Internal server error'))
      }));

      await expect(service.findAll()).rejects.toThrow(InternalServerErrorException);

      expect(mockUserModel.find).toHaveBeenCalledTimes(1)
      expect(mockUserModel.find).toHaveBeenCalledWith()
    })
  })

  describe('FindOne Method', () => {
    it('should return a user', async () => {
      mockUserModel.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(userMock)
      });

      const result = await service.findOne('userId');

      expect(mockUserModel.findById).toHaveBeenCalledTimes(1)
      expect(mockUserModel.findById).toHaveBeenCalledWith('userId')
      expect(result).toEqual(userMock)
    })

    it('should throw an error if user not found', async () => {
      mockUserModel.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(null)
      });

      await expect(service.findOne("userId")).rejects.toThrow(NotFoundException);

      expect(mockUserModel.findById).toHaveBeenCalledTimes(1)
      expect(mockUserModel.findById).toHaveBeenCalledWith('userId')
    })

    it('should handle internal server error', async () => {
      mockUserModel.findById.mockReturnValue({
        select: jest.fn().mockRejectedValue(new InternalServerErrorException('DB Error'))
      })

      await expect(service.findOne('userId')).rejects.toThrow(InternalServerErrorException)

      expect(mockUserModel.findById).toHaveBeenCalledTimes(1)
      expect(mockUserModel.findById).toHaveBeenCalledWith('userId')
    })
  })

  describe('Update Method', () => {
    it('should update a user', async () => {
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedNewPassword');
      mockUserModel.findByIdAndUpdate.mockReturnValue({
        select: jest.fn().mockResolvedValue(updateUserDtoMock)
      });

      const result = await service.update('userId', updateUserDtoMock);

      expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledTimes(1)
      expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledWith('userId', updateUserDtoMock, { new: true })
      expect(result).toEqual(updateUserDtoMock)
    })

    it('should throw an error if user not found', async () => {
      mockUserModel.findByIdAndUpdate.mockReturnValue({
        select: jest.fn().mockResolvedValue(null)
      });

      await expect(service.update('userId', updateUserDtoMock)).rejects.toThrow(NotFoundException);

      expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledTimes(1)
      expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledWith('userId', updateUserDtoMock, { new: true })
    })

    it('should handle internal server error', async () => {
      mockUserModel.findByIdAndUpdate.mockReturnValue({
        select: jest.fn().mockRejectedValue(new InternalServerErrorException('DB Error'))
      });

      await expect(service.update('userId', updateUserDtoMock)).rejects.toThrow(InternalServerErrorException)

      expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledTimes(1)
      expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledWith('userId', updateUserDtoMock, { new: true })
    })
  })

  describe('Delete Method', () => {
    it('should delete a user', async () => {
      mockUserModel.findByIdAndDelete.mockResolvedValue(userMock);

      const result = await service.remove('userId');

      expect(mockUserModel.findByIdAndDelete).toHaveBeenCalledTimes(1)
      expect(mockUserModel.findByIdAndDelete).toHaveBeenCalledWith('userId')
      expect(result).toEqual('Usuário deletado com sucesso.')
    })

    it('should throw an error if user not found', async () => {
      mockUserModel.findByIdAndDelete.mockResolvedValue(null);

      await expect(service.remove('userId')).rejects.toThrow(NotFoundException)

      expect(mockUserModel.findByIdAndDelete).toHaveBeenCalledTimes(1)
      expect(mockUserModel.findByIdAndDelete).toHaveBeenCalledWith('userId')
    })

    it('should handle internal server error', async () => {
      mockUserModel.findByIdAndDelete.mockRejectedValue(new InternalServerErrorException('DB Error'))

      await expect(service.remove('userId')).rejects.toThrow(InternalServerErrorException)

      expect(mockUserModel.findByIdAndDelete).toHaveBeenCalledTimes(1)
      expect(mockUserModel.findByIdAndDelete).toHaveBeenCalledWith('userId')
    })
  })
});
