import { BadRequestException, HttpException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor (
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
  ) {}

  handleError(error: unknown) {
    console.error(error)
    if (error instanceof HttpException) throw error
    throw new InternalServerErrorException('Erro interno do servidor. Tente novamente mais tarde.')
  }

  async create(createUserDto: CreateUserDto) {
    try {
      const userExists = await this.userModel.findOne({ email: createUserDto.email })
      if (userExists) throw new BadRequestException('Email já cadastrado.')
      
      const hashPassword = await bcrypt.hash(createUserDto.password, 10);
      createUserDto.password = hashPassword;
      
      const createNewUser = await this.userModel.create(createUserDto);
      const { password, ...user } = createNewUser.toObject()

      return user;
    } catch (error) {
      this.handleError(error)
    }
  }

  async findAll() {
    try {
      const findAllUsers = await this.userModel.find().select("-password");
      return findAllUsers;
    } catch (error) {
      this.handleError(error)
    }
  }

  async findOne(id: string) {
    try {
      const findUser = await this.userModel.findById(id).select("-password");
      if (!findUser) throw new NotFoundException('Usuário não encontrado.')

      return findUser;
    } catch (error) {
      this.handleError(error)
    }
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    try {
      if (updateUserDto.password) {
        const hashPassword = await bcrypt.hash(updateUserDto.password, 10);
        updateUserDto.password = hashPassword;
      }

      const updateUser = await this.userModel.findByIdAndUpdate(id, updateUserDto, { new: true }).select("-password");
      if (!updateUser) throw new NotFoundException('Usuário não encontrado.')

      return updateUser;
    } catch (error) {
      this.handleError(error)
    }
  }

  async remove(id: string) {
    try {
      const deleteUser = await this.userModel.findByIdAndDelete(id);
      if (!deleteUser) throw new NotFoundException('Usuário não encontrado.')

      return "Usuário deletado com sucesso."
    } catch (error) {
      this.handleError(error)
    }
  }
}
