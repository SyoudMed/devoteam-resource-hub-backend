import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OffreService } from './offre.service';
import { OffreController } from './offre.controller';
import { Offre } from './entities/offre.entity';
import { Reservation } from 'src/Reservations/entities/reservation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Offre,Reservation])],
  providers: [OffreService],
  controllers: [OffreController],
})
export class OffreModule {}