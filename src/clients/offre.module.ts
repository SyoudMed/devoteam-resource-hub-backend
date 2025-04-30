import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OffreService } from './offre.service';
import { OffreController } from './offre.controller';
import { Offre } from './entities/offre.entity';
import { Reservation } from 'src/Reservations/entities/reservation.entity';
import { User } from 'src/users/entities/user.entity';
import { OffreSkill } from './entities/offre-skill.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Offre,Reservation,User,OffreSkill])],
  providers: [OffreService],
  controllers: [OffreController],
})
export class OffreModule {}