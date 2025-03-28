import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, ParseIntPipe, Patch } from '@nestjs/common';
import { EngineerService } from './engineer.service';
import { Engineer } from './entities/engineer.entity';

import { UserRole } from 'src/common/enum/UserRole.enum';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UpdateAvailabilityDto } from './dto/update-availability.dto';


@Controller('engineers')
export class EngineerController {
  constructor(private readonly engineerService: EngineerService) {}

  @UseGuards(JwtAuthGuard)
  @Get('listengineer')
  async findAllEngineers(): Promise<Engineer[]> {
    return this.engineerService.findAllEngineers();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MANAGER)
  @Post('create')
  async createEngineer(@Body() createEngineerDto: CreateUserDto): Promise<Engineer> {
    return this.engineerService.create(createEngineerDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MANAGER)
    async deleteEngineer(@Param('id') id: number) {
      return this.engineerService.delete(id);
  }
  
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MANAGER)
  @Patch(':id')
  updateAvailability(
  @Param('id', ParseIntPipe) id: number,
  @Body() updateAvailabilityDto: UpdateAvailabilityDto,
): Promise<Engineer> {
  console.log(`Requête reçue pour PATCH /engineers/${id}`, updateAvailabilityDto);
  return this.engineerService.updateAvailability(id, updateAvailabilityDto);
}

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findEngineerById(@Param('id') id: string): Promise<Engineer> {
    return this.engineerService.findEngineerById(+id); 
  }




}
