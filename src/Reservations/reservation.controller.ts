import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, UseGuards, Patch } from '@nestjs/common';
import { ReservationService } from './reservation.service';

import { Reservation } from './entities/reservation.entity';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { JwtAuthGuard } from 'src/auth/guards/auth.guard';

@Controller('reservations')
export class ReservationController {
  constructor(private readonly reservationService: ReservationService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createReservationDto: CreateReservationDto): Promise<Reservation> {
    return this.reservationService.create(createReservationDto);
  }

  @Get('commercial/:commercialId')
  @UseGuards(JwtAuthGuard)
  async getReservationsByCommercialId(
    @Param('commercialId', ParseIntPipe) commercialId: number,
  ): Promise<Reservation[]> {
    return this.reservationService.getReservationsByCommercialId(commercialId);
  }



  

  // Supprimer une réservation
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deleteReservation(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.reservationService.deleteReservation(id);
  }

  // Mettre à jour le statut d’une réservation
  @UseGuards(JwtAuthGuard)
  @Patch(':id/status')
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: 'accepted' | 'rejected' 
  ): Promise<Reservation> {
    return this.reservationService.updateStatus(id, status);
  }
}