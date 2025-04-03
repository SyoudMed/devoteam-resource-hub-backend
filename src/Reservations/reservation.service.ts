import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reservation } from './entities/reservation.entity';

import { Engineer } from '../engineer/entities/engineer.entity';
import { User } from '../users/entities/user.entity';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { AvailabilityStatus } from 'src/common/enum/AvailabilityStatus.enum';

@Injectable()
export class ReservationService {
  constructor(
    @InjectRepository(Reservation)
    private reservationRepository: Repository<Reservation>,
    @InjectRepository(Engineer)
    private engineerRepository: Repository<Engineer>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

 async create(createReservationDto: CreateReservationDto): Promise<Reservation> {
    const { engineerId, commercialId, startTime, endTime, duration, clientName, meetingPurpose } =
      createReservationDto;

    const engineer = await this.engineerRepository.findOne({ where: { id: engineerId } });
    if (!engineer) {
      throw new NotFoundException(`Ingénieur avec l'ID ${engineerId} non trouvé`);
    }

    if (engineer.reservationStatus) {
      throw new BadRequestException(`cette  ingénieur est déja  réservé pour un entretien.`);
    }
    const commercial = await this.userRepository.findOne({ where: { id: commercialId } });
    if (!commercial) {
      throw new NotFoundException(`Commercial avec l'ID ${commercialId} non trouvé`);
    }


    const reservation = this.reservationRepository.create({
      startTime,
      endTime,
      duration,
      clientName,
      meetingPurpose,
      engineer,
      commercial,
      status: 'pending',
    });


    const savedReservation = await this.reservationRepository.save(reservation);

    engineer.reservationStatus = true;
    await this.engineerRepository.save(engineer);

    return savedReservation;
  }
  


async getReservationsByCommercialId(commercialId: number): Promise<Reservation[]> {
  const commercial = await this.userRepository.findOne({ 
    where: { id: commercialId }
  });
  
  if (!commercial) {
    throw new NotFoundException(`Commercial avec l'ID ${commercialId} non trouvé`);
  }
  const reservations = await this.reservationRepository.find({
    where: { commercial: { id: commercialId } },
    relations: ['engineer', 'engineer.user', 'commercial'],
    order: { startTime: 'ASC' },
  });

  return reservations;
}


  

  
  async findOne(id: number): Promise<Reservation> {
    const reservation = await this.reservationRepository.findOne({
      where: { id },
      relations: ['engineer', 'commercial'],
    });
    if (!reservation) {
      throw new NotFoundException(`Réservation avec l'ID ${id} non trouvée`);
    }
    return reservation;
  }

  


  
  async deleteReservation(id: number): Promise<void> {
    const reservation = await this.reservationRepository.findOne({ where: { id } });
    if (!reservation) {
      throw new NotFoundException(`Réservation avec l'ID ${id} non trouvée`);
    }
    await this.reservationRepository.delete(id);
  }

  async updateStatus(id: number, status: 'accepted' | 'rejected' | 'pending'): Promise<Reservation> {
    const reservation = await this.reservationRepository.findOne({
      where: { id },
      relations: ['engineer', 'engineer.user', 'commercial'],
    });

    if (!reservation) {
      throw new NotFoundException(`Réservation avec l'ID ${id} non trouvée`);
    }

    const engineer = reservation.engineer;

    
    if (status === 'accepted' && engineer.disponibiliteStatus === AvailabilityStatus.UNAVAILABLE) {
      throw new BadRequestException(`Cet ingénieur est sous une mission.`);
    }

    
    if (status === 'rejected' && reservation.status !== 'rejected') {
      engineer.reservationStatus = false; 
      engineer.disponibiliteStatus = AvailabilityStatus.AVAILABLE; 
    } else if (status === 'accepted' && engineer.disponibiliteStatus === AvailabilityStatus.AVAILABLE) {
      engineer.disponibiliteStatus = AvailabilityStatus.UNAVAILABLE; 
    }
    await this.engineerRepository.save(engineer);
    reservation.status = status;
    return this.reservationRepository.save(reservation);
  }
}