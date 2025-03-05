import { Controller, Post, Body, Get, UseGuards, Request, Header, Param, Put, Delete } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import {  JwtAuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from 'src/common/enum/UserRole.enum';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  
  @Post('create')
  /*@UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MANAGER)*/
  async createUser(@Body() createUserDto: CreateUserDto) {
    
    return this.usersService.createUser(createUserDto);
  }

/*
  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MANAGER)
  
  async updateUser(
    @Param('id') id:number,
    @Body() updateUserDto: UpdateUserDto
    
  ){
    return this.usersService.updateUser(id,updateUserDto);
  }
  */


  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MANAGER)
  async deleteUser(@Param('id') id: number) {
    return this.usersService.deleteUser(id);
  }

  @Get('list')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MANAGER)
  async findAll() {
    return this.usersService.findAll();
  }
}
