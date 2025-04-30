import {Controller,Get,Post,Put,Patch,Delete,Body,Param,Query,UseGuards,ParseIntPipe,UseInterceptors,UploadedFile, BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { EngineerService } from './engineer.service';
import { Engineer } from './entities/engineer.entity';
import { UserRole } from 'src/common/enum/UserRole.enum';
import { Roles } from 'src/auth/decorators/roles.decorator';
// import { JwtAuthGuard } from 'src/auth/guards/auth.guard';
// import { RolesGuard } from 'src/auth/guards/roles.guard';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UpdateAvailabilityDto } from './dto/update-availability.dto';
import { UpdateEngineerProfileDto } from './dto/update-engineer-profile.dto';
import { CreateEngineerDto } from './dto/create-engineer.dto';

@Controller('engineers')

export class EngineerController {
  constructor(private readonly engineerService: EngineerService) {}

  @Post('upload-from-cv')
  async uploadEngineerFromCv(@Body() createEngineerDto: CreateEngineerDto) {
    console.log("📥 Reçu upload-from-cv :", createEngineerDto);
    return this.engineerService.uploadEngineerFromCv(createEngineerDto);
  }


  // Lister tous les ingénieurs
  @Get('listengineer')
  async findAllEngineers(): Promise<Engineer[]> {
    return this.engineerService.findAllEngineers();
  }

  // Créer un ingénieur 
  @Roles(UserRole.MANAGER)
  @Post('create')
  async createEngineer(@Body() createEngineerDto: CreateUserDto): Promise<Engineer> {
    return this.engineerService.create(createEngineerDto);
  }

  // Supprimer un ingénieur 
  @Roles(UserRole.MANAGER)
  @Delete(':id')
  async deleteEngineer(@Param('id', ParseIntPipe) id: number): Promise<{ message: string }> {
    return this.engineerService.delete(id);
  }

  // Mettre à jour la disponibilité d’un ingénieur
  @Roles(UserRole.MANAGER)
  @Patch(':id')
  async updateAvailability(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAvailabilityDto: UpdateAvailabilityDto,
  ): Promise<Engineer> {
    return this.engineerService.updateAvailability(id, updateAvailabilityDto);
  }

  // Récupérer un ingénieur par ID
  @Get(':id')
  async findEngineerById(@Param('id', ParseIntPipe) id: number): Promise<Engineer> {
    return this.engineerService.findEngineerById(id);
  }

  // Récupérer un ingénieur par userId
  @Get("by-user/:userId")
  async getEngineerByUserId(@Param("userId", ParseIntPipe) userId: number) {
    console.log(`Appel de getEngineerByUserId avec userId: ${userId}`);
    return this.engineerService.findEngineerByUserId(userId);
}
  // Mettre à jour le profil d’un ingénieur avec fichier CV optionnel
  // @Patch('profile/:id')
  // async updateProfile(
  //   @Param('id', ParseIntPipe) id: number,
  //   @Body() updateEngineerProfileDto: UpdateEngineerProfileDto,
  // ): Promise<Engineer> {
  //   return this.engineerService.updateProfile(id, updateEngineerProfileDto);
  // }

  // Uploader un CV 
  @Post(':id/cv')
  @UseInterceptors(FileInterceptor('file'))
  async uploadCv(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<Engineer> {
    return this.engineerService.uploadEngineerCv(id, file);
  }

  // Récupérer les ingénieurs avec pagination et filtres
  @Get()
  async findPaginatedEngineers(
    @Query("page", ParseIntPipe) page: number = 1,
    @Query("limit", ParseIntPipe) limit: number = 10,
    @Query("search") search?: string,
    @Query("specialty") specialty?: string,
  ): Promise<PaginatedResponse<Engineer>> {
    if (page < 1 || limit < 1) {
      throw new BadRequestException("La page et la limite doivent être supérieures à 0");
    }

    const paginationParams: PaginationParams = {
      page,
      limit,
      search,
      specialty,
    };

    return this.engineerService.findPaginatedEngineers(paginationParams);
  }


  
  

 /* @Get('stats/count')
async getEngineersCount() {
  return {
    total: await this.engineerService.getTotalEngineersCount(),
  };
}*/
@Get('stats/count')
  async getEngineerStats() {
    const [total, availabilityCounts] = await Promise.all([
      this.engineerService.getTotalEngineersCount(),
      this.engineerService.getAvailabilityCounts(),
    ]);
    
    return {
      total,
      available: availabilityCounts.available,
      unavailable: availabilityCounts.unavailable
    };
  }
  

  @Get('stats/availability-count')
  
  async getAvailabilityCounts(): Promise<{ available: number; unavailable: number }> {
    return this.engineerService.getAvailabilityCounts();
  }
}