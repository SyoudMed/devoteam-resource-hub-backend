import { Controller, Get, Post, Patch, Delete, Param, Body, ParseIntPipe, UseGuards } from '@nestjs/common';
import { OffreService } from './offre.service';
import { CreateOffreDto } from './dto/create-offre.dto';
import { UpdateOffreDto } from './dto/update-offre.dto';
import { Offre, Speciality } from './entities/offre.entity';
import { UserRole } from 'src/common/enum/UserRole.enum';
import { JwtAuthGuard } from 'src/auth/guards/auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';

@Controller('offres')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OffreController {
  constructor(private readonly offreService: OffreService) {}

  @Post()
  @Roles(UserRole.COMMERCIAL)
  async create(@Body() createOffreDto: CreateOffreDto): Promise<Offre> {
    return this.offreService.create(createOffreDto);
  }

  @Get()
  @Roles(UserRole.COMMERCIAL, UserRole.MANAGER) // MANAGER peut aussi voir toutes les offres
  async findAll(): Promise<Offre[]> {
    return this.offreService.findAll();
  }

  @Get('pending')
  @Roles(UserRole.COMMERCIAL, UserRole.MANAGER) // MANAGER peut aussi voir les offres en attente
  async findAllPending(): Promise<Offre[]> {
    return this.offreService.findAllPending();
  }

  @Get(':id')
  @Roles(UserRole.COMMERCIAL, UserRole.MANAGER) // MANAGER peut aussi voir une offre spécifique
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Offre> {
    return this.offreService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.COMMERCIAL)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateOffreDto: UpdateOffreDto,
  ): Promise<Offre> {
    return this.offreService.update(id, updateOffreDto);
  }

  @Delete(':id')
  @Roles(UserRole.COMMERCIAL)
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.offreService.remove(id);
  }

  @Get('count/count-by-speciality')
  @Roles(UserRole.COMMERCIAL, UserRole.MANAGER) // MANAGER peut aussi voir les statistiques
  async getOffersCountBySpeciality(): Promise<{ speciality: Speciality; count: number }[]> {
    return this.offreService.getOffersCountBySpeciality();
  }

  @Get('count/count-by-status')
  @Roles(UserRole.COMMERCIAL, UserRole.MANAGER) // MANAGER peut aussi voir les statistiques
  async getOffersCountByStatus(): Promise<{ en_cours: number; en_attente: number }> {
    return this.offreService.getOffersCountByStatus();
  }
}