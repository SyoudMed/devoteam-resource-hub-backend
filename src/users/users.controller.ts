// src/users/users.controller.ts
import { Controller, Post, Body, Get, UseGuards, Request, Param, Put, Delete, HttpStatus, HttpCode, UseInterceptors, ParseIntPipe, UploadedFile } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from 'src/common/enum/UserRole.enum';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { FileInterceptor } from '@nestjs/platform-express'; 
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

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

  @Get(':id')
  async getUserById(@Param('id') id: number): Promise<User | null> {
    const user = await this.usersService.findById(id);
    return user;
  }

  @Post(':id/update-profile')
@UseInterceptors(FileInterceptor('file'))
@UseGuards(JwtAuthGuard)
async updateProfile(
  @Param('id', ParseIntPipe) id: number,
  @Body() updateProfileDto: UpdateUserDto,
  @UploadedFile() file?: Express.Multer.File,
) {
  return this.usersService.updateProfile(id, updateProfileDto, file);
}

  @Delete(':id/delete-photo')
  @UseGuards(JwtAuthGuard)
  async deleteProfilePhoto(@Param('id', ParseIntPipe) userId: number): Promise<User> {
    return this.usersService.deleteProfilePhoto(userId);
  }

  
}