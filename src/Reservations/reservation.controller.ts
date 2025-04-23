import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, UseGuards, Patch, BadRequestException, Query } from '@nestjs/common';
import { ReservationService } from './reservation.service';
import { PaginationParams, PaginatedResponse } from './dto/pagination-params.dto';
import { Reservation } from './entities/reservation.entity';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { JwtAuthGuard } from 'src/auth/guards/auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';

@Controller('reservations')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReservationController {
  constructor(private readonly reservationService: ReservationService) {}

  
  @Post()
  create(@Body() createReservationDto: CreateReservationDto): Promise<Reservation> {
    return this.reservationService.create(createReservationDto);
  }


  @Get('commercial/:commercialId')
  async getReservationsByCommercialId(
    @Param('commercialId', ParseIntPipe) commercialId: number,
  ): Promise<Reservation[]> {
    return this.reservationService.getReservationsByCommercialId(commercialId);
  }



  

  // Supprimer une réservation
  
  @Delete(':id')
  async deleteReservation(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.reservationService.deleteReservation(id);
  }

  // Mettre à jour le statut d’une réservation
  
  @Patch(':id/status')
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: 'accepted' | 'rejected' 
  ): Promise<Reservation> {
    return this.reservationService.updateStatus(id, status);
  }


  @Get('paginatedCommercialReservations')
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
  
  async getReservationStatusCounts(): Promise<{ pending: number; accepted: number; rejected: number }> {
    return this.reservationService.getReservationStatusCounts();
  }


  @Get('engineer/:engineerId/pending')
  async getPendingReservationsByEngineerId(
    @Param('engineerId', ParseIntPipe) engineerId: number,
  ): Promise<Reservation[]> {
    return this.reservationService.getPendingReservationsByEngineerId(engineerId);
  }


}