import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReservationService } from './reservation.service';
import { ReservationController } from './reservation.controller';
import { Reservation } from './entities/reservation.entity';
import { Engineer } from '../engineer/entities/engineer.entity';
import { User } from '../users/entities/user.entity';
import { OffreService } from 'src/clients/offre.service';
import { Offre } from 'src/clients/entities/offre.entity';
import { MailService } from 'src/mail/mail.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Reservation, Engineer, User,Offre]), 
  ],
  controllers: [ReservationController],
  providers: [ReservationService,OffreService,MailService],
  exports: [ReservationService],
})
export class ReservationModule {}