import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { CommercialService } from './commercial.service';
import { User } from 'src/users/entities/user.entity';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UpdateUserDto } from 'src/users/dto/update-user.dto';
import { JwtAuthGuard } from 'src/auth/guards/auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/common/enum/UserRole.enum';


@Controller('commercials')
export class CommercialController {
  constructor(private readonly commercialService: CommercialService) {}


  @Post('create') 
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MANAGER) 
  async createCommercial(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.commercialService.createCommercial(createUserDto);  
  }

  @Get('list')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MANAGER)
  async getAll(): Promise<User[]> {
    return this.commercialService.getAllCommercials();
  }


  

  
    @Put(':id')
    @UseGuards(JwtAuthGuard)
    async update(
    @Param('id') id: number,
    @Body() updateUserDto: UpdateUserDto,
      ): Promise<User> {
        return this.commercialService.updateCommercial(id, updateUserDto);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.MANAGER)
    @Delete(':id')
    async remove(@Param('id') id: number): Promise<{ message: string }> {
      return this.commercialService.deleteCommercial(id);
    }
}
