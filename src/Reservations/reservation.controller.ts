import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, UseGuards, Patch, BadRequestException, Query } from '@nestjs/common';
import { ReservationService } from './reservation.service';
import { PaginationParams, PaginatedResponse } from './dto/pagination-params.dto';
import { Reservation } from './entities/reservation.entity';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { JwtAuthGuard } from 'src/auth/guards/auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/common/enum/UserRole.enum';

@Controller('reservations')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReservationController {
  constructor(private readonly reservationService: ReservationService) {}

  
  @Post()
  @Roles(UserRole.COMMERCIAL)
  create(@Body() createReservationDto: CreateReservationDto): Promise<Reservation> {
    return this.reservationService.create(createReservationDto);
  }


  @Get('commercial/:commercialId')
  @Roles(UserRole.COMMERCIAL)
  async getReservationsByCommercialId(
    @Param('commercialId', ParseIntPipe) commercialId: number,
  ): Promise<Reservation[]> {
    return this.reservationService.getReservationsByCommercialId(commercialId);
  }



  

  // Supprimer une réservation

  @Roles(UserRole.COMMERCIAL) 
  @Delete(':id')
  async deleteReservation(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.reservationService.deleteReservation(id);
  }

  // Mettre à jour le statut d’une réservation
  
  @Patch(':id/status')
  @Roles(UserRole.COMMERCIAL)
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: 'accepted' | 'rejected' 
  ): Promise<Reservation> {
    return this.reservationService.updateStatus(id, status);
  }


  @Get('paginatedCommercialReservations')
  @Roles(UserRole.COMMERCIAL, UserRole.MANAGER)
  async findPaginatedCommercialReservations(
    @Query('page', ParseIntPipe) page: number = 1,
    @Query('limit', ParseIntPipe) limit: number = 10,
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('commercialId', ParseIntPipe) commercialId?: number,
  ): Promise<PaginatedResponse<Reservation>> {
    if (page < 1 || limit < 1) {
      throw new BadRequestException('La page et la limite doivent être supérieures à 0');
    }

    const paginationParams: PaginationParams = {
      page,
      limit,
      search,
      status,
      commercialId,
    };

    return this.reservationService.findPaginatedCommercialReservations(paginationParams);
  }

  

  @Get('paginated')
  @Roles(UserRole.COMMERCIAL, UserRole.MANAGER)
  async getPaginatedReservations(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('search') search = '',
    @Query('status') status = '',
  ): Promise<PaginatedResponse<Reservation>> {
    return this.reservationService.findPaginatedReservations({
      page: Number(page),
      limit: Number(limit),
      search,
      status,
    });
  }

  @Get('status-count')
  @Roles(UserRole.COMMERCIAL, UserRole.MANAGER)
  async getReservationStatusCounts(): Promise<{ pending: number; accepted: number; rejected: number }> {
    return this.reservationService.getReservationStatusCounts();
  }


  @Get('engineer/:engineerId/pending')
  @Roles(UserRole.INGENIEUR)
  async getPendingReservationsByEngineerId(
    @Param('engineerId', ParseIntPipe) engineerId: number,
  ): Promise<Reservation[]> {
    return this.reservationService.getPendingReservationsByEngineerId(engineerId);
  }



  @Roles(UserRole.COMMERCIAL)
  @Get('pending-past/:commercialId')
  async getPendingPastReservations(@Param('commercialId', ParseIntPipe) commercialId: number) {
    return this.reservationService.getPendingPastReservationsByCommercialId(commercialId);
  }


}