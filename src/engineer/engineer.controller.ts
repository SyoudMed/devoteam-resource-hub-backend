import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, ParseIntPipe, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { EngineerService } from './engineer.service';
import { Engineer } from './entities/engineer.entity';
import { UserRole } from 'src/common/enum/UserRole.enum';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UpdateAvailabilityDto } from './dto/update-availability.dto';
import { UpdateEngineerProfileDto } from './dto/update-engineer-profile.dto';
import { ProfileUpdateGateway } from 'src/profile-update.gateway';
import { AvailabilityStatus } from 'src/common/enum/AvailabilityStatus.enum';
import { PaginatedResponse, PaginationParams } from './dto/pagination-params.dto';

@Controller('engineers')

export class EngineerController {
  constructor(
    private readonly engineerService: EngineerService,
    private readonly profileUpdateGateway: ProfileUpdateGateway,
  ) {}

  // Lister tous les ingénieurs
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('listengineer')
  async findAllEngineers(): Promise<Engineer[]> {
    return this.engineerService.findAllEngineers();
  }

  // Créer un ingénieur 
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MANAGER)
  @Post('create')
  async createEngineer(@Body() createEngineerDto: CreateUserDto): Promise<Engineer> {
    return this.engineerService.create(createEngineerDto);
  }

  // Supprimer un ingénieur 
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MANAGER)
  @Delete(':id')
  async deleteEngineer(@Param('id', ParseIntPipe) id: number): Promise<{ message: string }> {
    return this.engineerService.delete(id);
  }

  // Mettre à jour la disponibilité d’un ingénieur
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MANAGER)
  @Patch(':id')
  async updateAvailability(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAvailabilityDto: UpdateAvailabilityDto,
  ): Promise<Engineer> {
    return this.engineerService.updateAvailability(id, updateAvailabilityDto);
  }

  // Récupérer un ingénieur par ID
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findEngineerById(@Param('id', ParseIntPipe) id: number): Promise<Engineer> {
    return this.engineerService.findEngineerById(id);
  }

  // Récupérer un ingénieur par userId
  @UseGuards(JwtAuthGuard)
  @Get("by-user/:userId")
  async getEngineerByUserId(@Param("userId", ParseIntPipe) userId: number) {
    return this.engineerService.findEngineerByUserId(userId);
  }

  // Mettre à jour le profil d’un ingénieur
  @Patch('profile/:id')
  async updateProfile(
    
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEngineerProfileDto,
  ) {
    const updated = await this.engineerService.updateProfile(id, dto);
    
    this.profileUpdateGateway.notifyProfileUpdate(
      id,
      'success',
      'Profil mis à jour avec succès',
      Date.now().toString(),
    );
    return updated;
  }

  // Uploader un CV 
  @UseGuards(JwtAuthGuard)
  @Post(':id/cv')
  @UseInterceptors(FileInterceptor('file'))
  async uploadCv(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<Engineer> {
    return this.engineerService.uploadEngineerCv(id, file);
  }

  
  @UseGuards(JwtAuthGuard)
  @Get()
  async findPaginatedEngineers(
    @Query("page", ParseIntPipe) page: number = 1,
    @Query("limit", ParseIntPipe) limit: number = 10,
    @Query("search") search?: string,
    @Query("specialty") specialty?: string,
    @Query('availability') availability?: AvailabilityStatus,
  ): Promise<PaginatedResponse<Engineer>> {
    if (page < 1 || limit < 1) {
      throw new BadRequestException("La page et la limite doivent être supérieures à 0");
    }

    const paginationParams: PaginationParams = {
      page,
      limit,
      search,
      specialty,
      availability,
    };

    return this.engineerService.findPaginatedEngineers(paginationParams);
  }

  @UseGuards(JwtAuthGuard)
  @Get('stats/count')
  async getEngineerStats() {
    const [total, availabilityCounts] = await Promise.all([
      this.engineerService.getTotalEngineersCount(),
      this.engineerService.getAvailabilityCounts(),
    ]);
    
    return {
      total,
      available: availabilityCounts.available,
      unavailable: availabilityCounts.unavailable,
    };
  }


  @UseGuards(JwtAuthGuard)
  @Get('stats/availability-count')
  async getAvailabilityCounts(): Promise<{ available: number; unavailable: number }> {
    return this.engineerService.getAvailabilityCounts();
  }


  @UseGuards(JwtAuthGuard)
  @Post('notify-profile-update')
  async notifyProfileUpdate(
    @Body() body: { engineerId: number; taskId: string; status: string; message: string },
  ) {
    this.profileUpdateGateway.notifyProfileUpdate(
      body.engineerId,
      body.status,
      body.message,
      body.taskId,
    );
    return { message: 'Notification envoyée' };
  }

  
}