import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from '../../users.controller';
import { UsersService } from '../../users.service';
import { BadRequestException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { AuthGuard } from '../../../auth/auth.guard';
import { AuthorizationGuard } from '../../../authorization/guard/authorization.guard';
import { authUserMock, createUserDtoMock, mockUserService, updateUserDtoMock, userMock } from '../mocks/users.mocks';

describe('UsersController', () => {
  let userController: UsersController;
  let userService: UsersService;

  beforeAll(async () => {
    const userModuleTest: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUserService,
        }
      ]
    })
      .overrideGuard(AuthGuard) // inicializando o guard
      .useValue({ 
        canActivate: jest.fn().mockReturnValue(true)
      }) // simula acesso autorizado no guard
      .overrideGuard(AuthorizationGuard) // inicializando o guard
      .useValue({ 
        canActivate: jest.fn().mockReturnValue(true)
      }) // simula acesso autorizado no guard
      .compile();

    userController = userModuleTest.get<UsersController>(UsersController);
    userService = userModuleTest.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(userController).toBeDefined();
    expect(userService).toBeDefined();
  })

  describe('Create Method', () => {
    it('should create a new user', async () => {
      (userService.create as jest.Mock).mockResolvedValue(createUserDtoMock);

      const result = await userController.create(createUserDtoMock);

      expect(userService.create).toHaveBeenCalledTimes(1)
      expect(userService.create).toHaveBeenCalledWith(createUserDtoMock)
      expect(result).toEqual(createUserDtoMock)
    })

    it('should throw an error if user already exists', async () => {
      (userService.create as jest.Mock).mockRejectedValue(new BadRequestException('User already exists'));

      await expect(userController.create(createUserDtoMock)).rejects.toThrow(BadRequestException);

      expect(userService.create).toHaveBeenCalledTimes(1)
      expect(userService.create).toHaveBeenCalledWith(createUserDtoMock)
    })

    it('should handle internal server error', async () => {
      (userService.create as jest.Mock).mockRejectedValue(new InternalServerErrorException('Internal server error. It was not possible to create the user.'));

      await expect(userController.create(createUserDtoMock)).rejects.toThrow(InternalServerErrorException);

      expect(userService.create).toHaveBeenCalledTimes(1)
      expect(userService.create).toHaveBeenCalledWith(createUserDtoMock)
    })
  })

  describe('FindAll Method', () => {
    it('should return an array of users', async () => {
      (userService.findAll as jest.Mock).mockResolvedValue([userMock]);

      const result = await userController.findAll();

      expect(userService.findAll).toHaveBeenCalledTimes(1)
      expect(userService.findAll).toHaveBeenCalledWith()
      expect(result).toEqual([userMock])
    })

    it('should handle internal server error', async () => {
      (userService.findAll as jest.Mock).mockRejectedValue(new InternalServerErrorException('Internal server error. It was not possible to find the users.'))

      await expect(userController.findAll()).rejects.toThrow(InternalServerErrorException);

      expect(userService.findAll).toHaveBeenCalledTimes(1)
      expect(userService.findAll).toHaveBeenCalledWith()
    })
  })

  describe('FindOne Method', () => {
    it('should return a user', async () => {
      (userService.findOne as jest.Mock).mockResolvedValue(userMock);

      const result = await userController.findOne('userId');

      expect(userService.findOne).toHaveBeenCalledTimes(1)
      expect(userService.findOne).toHaveBeenCalledWith('userId')
      expect(result).toEqual(userMock)
    })

    it('should throw an error if user not found', async () => {
      (userService.findOne as jest.Mock).mockRejectedValue(new NotFoundException('User not found'))

      await expect(userController.findOne('userId')).rejects.toThrow(NotFoundException);

      expect(userService.findOne).toHaveBeenCalledTimes(1)
      expect(userService.findOne).toHaveBeenCalledWith('userId')
    })

    it('should handle internal server error', async () => {
      (userService.findOne as jest.Mock).mockRejectedValue(new InternalServerErrorException('Internal server error. It was not possible to find the user.'))

      await expect(userController.findOne('userId')).rejects.toThrow(InternalServerErrorException)

      expect(userService.findOne).toHaveBeenCalledTimes(1)
      expect(userService.findOne).toHaveBeenCalledWith('userId')
    })
  })

  describe('Update Method', () => {
    it('should update a user', async () => {
      (userService.update as jest.Mock).mockResolvedValue(updateUserDtoMock);

      const result = await userController.update('userId', updateUserDtoMock);

      expect(userService.update).toHaveBeenCalledTimes(1)
      expect(userService.update).toHaveBeenCalledWith('userId', updateUserDtoMock)

      expect(result).toEqual(updateUserDtoMock)
    })

    it('should throw an error if user not found', async () => {
      (userService.update as jest.Mock).mockRejectedValue(new NotFoundException('User not found'))

      await expect(userController.update('userId', updateUserDtoMock)).rejects.toThrow(NotFoundException);

      expect(userService.update).toHaveBeenCalledTimes(1)
      expect(userService.update).toHaveBeenCalledWith('userId', updateUserDtoMock)
    })

    it('should handle internal server error', async () => {
      (userService.update as jest.Mock).mockRejectedValue(new InternalServerErrorException('Internal server error. It was not possible to update the user.'))

      await expect(userController.update('userId', updateUserDtoMock)).rejects.toThrow(InternalServerErrorException)

      expect(userService.update).toHaveBeenCalledTimes(1)
      expect(userService.update).toHaveBeenCalledWith('userId', updateUserDtoMock)
    })
  })

  describe('Delete Method', () => {
    it('should delete a user', async () => {
      (userService.remove as jest.Mock).mockResolvedValue('User deleted successfully');

      const result = await userController.remove('userId');

      expect(userService.remove).toHaveBeenCalledTimes(1)
      expect(userService.remove).toHaveBeenCalledWith('userId')
      expect(result).toEqual('User deleted successfully')
    })

    it('should throw an error if user not found', async () => {
      (userService.remove as jest.Mock).mockRejectedValue(new NotFoundException('User not found'))

      await expect(userController.remove('userId')).rejects.toThrow(NotFoundException);

      expect(userService.remove).toHaveBeenCalledTimes(1)
      expect(userService.remove).toHaveBeenCalledWith('userId')
    })

    it('should handle internal server error', async () => {
      (userService.remove as jest.Mock).mockRejectedValue(new InternalServerErrorException('Internal server error. It was not possible to delete the user.'))

      await expect(userController.remove('userId')).rejects.toThrow(InternalServerErrorException)

      expect(userService.remove).toHaveBeenCalledTimes(1)
      expect(userService.remove).toHaveBeenCalledWith('userId')
    })
  })

  describe('Me Method', () => {
    it('should return a user', async () => {
      (userService.findOne as jest.Mock).mockResolvedValue(userMock);

      const result = await userController.me(authUserMock);

      expect(userService.findOne).toHaveBeenCalledTimes(1)
      expect(userService.findOne).toHaveBeenCalledWith(authUserMock.sub)
      expect(result).toEqual(userMock)
    })

    it('should throw an error if user not found', async () => {
      (userService.findOne as jest.Mock).mockRejectedValue(new NotFoundException('User not found'))

      await expect(userController.me(authUserMock)).rejects.toThrow(NotFoundException)

      expect(userService.findOne).toHaveBeenCalledTimes(1)
      expect(userService.findOne).toHaveBeenCalledWith(authUserMock.sub)
    })

    it('should handle internal server error', async () => {
      (userService.findOne as jest.Mock).mockRejectedValue(new InternalServerErrorException('Internal server error. It was not possible to get the user.'))

      await expect(userController.me(authUserMock)).rejects.toThrow(InternalServerErrorException)

      expect(userService.findOne).toHaveBeenCalledTimes(1)
      expect(userService.findOne).toHaveBeenCalledWith(authUserMock.sub)
    })
  })

  describe('UpdateMe Method', () => {
    it('should update a user', async () => {
      (userService.update as jest.Mock).mockResolvedValue(updateUserDtoMock);

      const result = await userController.updateMe(authUserMock, updateUserDtoMock);

      expect(userService.update).toHaveBeenCalledTimes(1)
      expect(userService.update).toHaveBeenCalledWith(authUserMock.sub, updateUserDtoMock)
      expect(result).toEqual(updateUserDtoMock)
    })

    it('should throw an error if user not found', async () => {
      (userService.update as jest.Mock).mockRejectedValue(new NotFoundException('User not found'))

      await expect(userController.updateMe(authUserMock, updateUserDtoMock)).rejects.toThrow(NotFoundException);

      expect(userService.update).toHaveBeenCalledTimes(1)
      expect(userService.update).toHaveBeenCalledWith(authUserMock.sub, updateUserDtoMock)
    })

    it('should handle internal server error', async () => {
      (userService.update as jest.Mock).mockRejectedValue(new InternalServerErrorException('Internal server error. It was not possible to update the user.'))

      await expect(userController.updateMe(authUserMock, updateUserDtoMock)).rejects.toThrow(InternalServerErrorException)

      expect(userService.update).toHaveBeenCalledTimes(1)
      expect(userService.update).toHaveBeenCalledWith(authUserMock.sub, updateUserDtoMock)
    })
  })
});
