import { Controller, Get, Post, Body, Param, Delete, Put, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from '../auth/auth.guard';
import * as authUserDecorator from '../../utils/decorators/auth-user.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @UseGuards(AuthGuard)
  async me(@authUserDecorator.AuthUser() user: authUserDecorator.AuthUserType) {
    return await this.usersService.findOne(user.sub);
  }

  @Put('me')
  @UseGuards(AuthGuard)
  async updateMe(@authUserDecorator.AuthUser() user: authUserDecorator.AuthUserType, @Body() updateUserDto: UpdateUserDto) {
    return await this.usersService.update(user.sub, updateUserDto);
  }

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    return await this.usersService.create(createUserDto);
  }

  @Get()
  @UseGuards(AuthGuard)
  async findAll() {
    return await this.usersService.findAll();
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  async findOne(@Param('id') id: string) {
    return await this.usersService.findOne(id);
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return await this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  async remove(@Param('id') id: string) {
    return await this.usersService.remove(id);
  }
}
