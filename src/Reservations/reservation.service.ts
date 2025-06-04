import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, LessThan, Like, Not, Repository } from 'typeorm';
import { Reservation } from './entities/reservation.entity';
import { PaginationParams, PaginatedResponse } from './dto/pagination-params.dto';
import { Engineer } from '../engineer/entities/engineer.entity';
import { User } from '../users/entities/user.entity';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { AvailabilityStatus } from 'src/common/enum/AvailabilityStatus.enum';
import { Offre, OffreStatus } from 'src/clients/entities/offre.entity';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class ReservationService {
  constructor(
    @InjectRepository(Reservation)
    private reservationRepository: Repository<Reservation>,
    @InjectRepository(Engineer)
    private engineerRepository: Repository<Engineer>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Offre)
    private readonly offreRepository: Repository<Offre>,
    private readonly mailService: MailService,
  ) {}

  async create(createReservationDto: CreateReservationDto): Promise<Reservation> {
    const { engineerId, commercialId, startTime, endTime, duration, clientName, meetingPurpose, offreId } =
      createReservationDto;

    const engineer = await this.engineerRepository.findOne({
      where: { id: engineerId },
      relations: ["user"], 
    });
    if (!engineer) {
      throw new NotFoundException(`Ingénieur avec l'ID ${engineerId} non trouvé`);
    }

    if (engineer.disponibiliteStatus === AvailabilityStatus.UNAVAILABLE) {
      throw new BadRequestException(`Cet ingénieur n'est pas disponible.`);
    }

    const commercial = await this.userRepository.findOne({ where: { id: commercialId } });
    if (!commercial) {
      throw new NotFoundException(`Commercial avec l'ID ${commercialId} non trouvé`);
    }

    const offre = await this.offreRepository.findOne({ where: { id: offreId } });
    if (!offre) {
      throw new NotFoundException(`Offre avec l'ID ${offreId} non trouvée`);
    }

    const reservation = this.reservationRepository.create({
      startTime,
      endTime,
      duration,
      clientName,
      meetingPurpose,
      engineer,
      commercial,
      offre,
      status: "pending",
    });

    const savedReservation = await this.reservationRepository.save(reservation);

    engineer.disponibiliteStatus = AvailabilityStatus.UNAVAILABLE;
    await this.engineerRepository.save(engineer);

    try {
      await this.mailService.sendReservationNotificationEmail(
        engineer.user.email, 
        {
          engineerName: `${engineer.user.firstName} ${engineer.user.lastName}`,
          startTime: new Date(startTime).toLocaleString("fr-FR"),
          endTime: new Date(endTime).toLocaleString("fr-FR"),
          duration: duration.toString(),
          clientName,
          meetingPurpose,
          offreTitle: offre.jobTitle,
          commercialName: `${commercial.firstName} ${commercial.lastName}`,
        },
      );
    } catch (error) {
      console.error("Erreur lors de l'envoi de l'email à l'ingénieur :", error);
    }
    return savedReservation;
  }



  async findPaginatedCommercialReservations({
  page,
  limit,
  search = '',
  status = '',
  commercialId,
}: PaginationParams): Promise<PaginatedResponse<Reservation>> {
  const skip = (page - 1) * limit;

  const queryBuilder = this.reservationRepository.createQueryBuilder('reservation')
    .leftJoinAndSelect('reservation.engineer', 'engineer')
    .leftJoinAndSelect('engineer.user', 'user')
    .leftJoinAndSelect('reservation.commercial', 'commercial')
    .leftJoinAndSelect('reservation.offre', 'offre')
    .leftJoinAndSelect('offre.requiredSkills', 'requiredSkills');

  if (commercialId) {
    queryBuilder.andWhere('commercial.id = :commercialId', { commercialId });
  }

  if (status && ['accepted', 'rejected', 'pending'].includes(status)) {
    queryBuilder.andWhere('reservation.status = :status', { status });
  }

  if (search) {
    queryBuilder.andWhere(
      new Brackets(qb => {
        qb.where('reservation.clientName LIKE :search', { search: `%${search}%` })
          .orWhere('reservation.meetingPurpose LIKE :search', { search: `%${search}%` })
          .orWhere('user.email LIKE :search', { search: `%${search}%` })
          .orWhere('user.firstName LIKE :search', { search: `%${search}%` })
          .orWhere('user.lastName LIKE :search', { search: `%${search}%` });
      })
    );
  }

  queryBuilder.orderBy('reservation.id', 'ASC')
    .skip(skip)
    .take(limit);

  const [reservations, total] = await queryBuilder.getManyAndCount();

  return {
    data: reservations,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    limit,
  };
}

async findPaginatedReservations({
  page,
  limit,
  search = '',
  status = '',
}: PaginationParams): Promise<PaginatedResponse<Reservation>> {
  const skip = (page - 1) * limit;

  const queryBuilder = this.reservationRepository.createQueryBuilder('reservation')
    .leftJoinAndSelect('reservation.engineer', 'engineer')
    .leftJoinAndSelect('engineer.user', 'user')
    .leftJoinAndSelect('reservation.commercial', 'commercial')
    .leftJoinAndSelect('reservation.offre', 'offre')
    .leftJoinAndSelect('offre.requiredSkills', 'requiredSkills');

  if (status && ['accepted', 'rejected', 'pending'].includes(status)) {
    queryBuilder.andWhere('reservation.status = :status', { status });
  }

  if (search) {
    queryBuilder.andWhere(
      new Brackets(qb => {
        qb.where('reservation.clientName LIKE :search', { search: `%${search}%` })
          .orWhere('reservation.meetingPurpose LIKE :search', { search: `%${search}%` })
          .orWhere('user.email LIKE :search', { search: `%${search}%` })
          .orWhere('user.firstName LIKE :search', { search: `%${search}%` })
          .orWhere('user.lastName LIKE :search', { search: `%${search}%` });
      })
    );
  }

  queryBuilder.orderBy('reservation.id', 'ASC')
    .skip(skip)
    .take(limit);

  const [reservations, total] = await queryBuilder.getManyAndCount();

  return {
    data: reservations,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    limit,
  };
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
    relations: ['engineer', 'engineer.user', 'commercial', 'offre', 'offre.requiredSkills'],
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

  async deleteReservation(id: number, commercialId?: number): Promise<void> {
    const reservation = await this.reservationRepository.findOne({
      where: { id },
      relations: ['engineer', 'engineer.user', 'commercial', 'offre'], 
    });

    if (!reservation) {
      throw new NotFoundException(`Réservation avec l'ID ${id} non trouvée`);
    }

    if (commercialId && reservation.commercial.id !== commercialId) {
      throw new BadRequestException("Vous n'êtes pas autorisé à supprimer cette réservation");
    }

    const currentDate = new Date();
    const startTime = new Date(reservation.startTime);
    const isFutureReservation = startTime > currentDate;

    if (reservation.status === 'pending' && reservation.engineer) {
      reservation.engineer.disponibiliteStatus = AvailabilityStatus.AVAILABLE;
      await this.engineerRepository.save(reservation.engineer);
    }
    if (isFutureReservation && reservation.engineer?.user?.email) {
      try {
        await this.mailService.sendReservationCancellationEmail(
          reservation.engineer.user.email,
          {
            engineerName: `${reservation.engineer.user.firstName} ${reservation.engineer.user.lastName}`,
            startTime: startTime.toLocaleString('fr-FR'),
            endTime: new Date(reservation.endTime).toLocaleString('fr-FR'),
            clientName: reservation.clientName,
            meetingPurpose: reservation.meetingPurpose,
            commercialName: `${reservation.commercial.firstName} ${reservation.commercial.lastName}`,
          },
        );
      } catch (error) {
        console.error("Erreur lors de l'envoi de l'email d'annulation à l'ingénieur :", error);
    
      }
    }

    await this.reservationRepository.delete(id);
}
  
  async updateStatus(id: number, status: 'accepted' | 'rejected' | 'pending'): Promise<Reservation> {
    const reservation = await this.reservationRepository.findOne({
      where: { id },
      relations: ['engineer', 'engineer.user', 'commercial', 'offre', 'offre.assignedEngineer'], // Ajouter offre.assignedEngineer
    });

    if (!reservation) {
      throw new NotFoundException(`Réservation avec l'ID ${id} non trouvée`);
    }

    const engineer = reservation.engineer;
    const offre = reservation.offre;

    const currentDate = new Date();
    if (reservation.startTime && currentDate < reservation.startTime) {
      throw new BadRequestException("Vous ne pouvez modifier le statut de la réservation car sa date n'est pas encore dépassée.");
    }

    if (status === 'accepted') {
      const existingAcceptedReservation = await this.reservationRepository.findOne({
        where: {
          offre: { id: offre.id },
          status: 'accepted',
          id: Not(id),
        },
        relations: ['engineer', 'engineer.user'],
      });

      if (existingAcceptedReservation) {
        throw new BadRequestException(
          `L'offre "${offre.jobTitle}" est déjà affectée à l'ingénieur ${existingAcceptedReservation.engineer.user.firstName} ${existingAcceptedReservation.engineer.user.lastName}.`
        );
      }
      engineer.disponibiliteStatus = AvailabilityStatus.UNAVAILABLE;

      offre.status = OffreStatus.ACCEPTER;
      offre.assignedEngineer = engineer;
      reservation.status = status;

      await this.offreRepository.save(offre);
    } else if (status === 'rejected') {
      if (engineer.disponibiliteStatus === AvailabilityStatus.UNAVAILABLE) {
        engineer.disponibiliteStatus = AvailabilityStatus.AVAILABLE;
      }
      reservation.status = status;
      const existingAcceptedReservation = await this.reservationRepository.findOne({
        where: {
          offre: { id: offre.id },
          status: 'accepted',
        },
      });

      if (!existingAcceptedReservation) {
        offre.status = OffreStatus.EN_ATTENTE;
        offre.assignedEngineer = null; 
        await this.offreRepository.save(offre);
      }
    } else {
      reservation.status = status;
    }

    
    await this.engineerRepository.save(engineer);
    await this.reservationRepository.save(reservation);

    return reservation;
}
  

  async getReservationStatusCounts(): Promise<{ pending: number; accepted: number; rejected: number }> {
    try {
      const [pendingCount, acceptedCount, rejectedCount] = await Promise.all([
        this.reservationRepository.count({ where: { status: 'pending' } }),
        this.reservationRepository.count({ where: { status: 'accepted' } }),
        this.reservationRepository.count({ where: { status: 'rejected' } }),
      ]);

      return {
        pending: pendingCount,
        accepted: acceptedCount,
        rejected: rejectedCount,
      };
    } catch (error) {
      throw new BadRequestException(
        'Erreur lors de la récupération des comptes des réservations par statut',
      );
    }
  }


  async getPendingReservationsByEngineerId(engineerId: number): Promise<Reservation[]> {
    const engineer = await this.engineerRepository.findOne({ 
      where: { id: engineerId }
    });
    
    if (!engineer) {
      throw new NotFoundException(`Ingénieur avec l'ID ${engineerId} non trouvé`);
    }
  
    const reservations = await this.reservationRepository.find({
      where: { 
        engineer: { id: engineerId },
        status: 'pending'
      },
      relations: ['engineer', 'engineer.user', 'commercial', 'offre','offre.requiredSkills'],
      order: { startTime: 'ASC' },
    });
  
    return reservations;
  }


  async getPendingPastReservationsByCommercialId(commercialId: number): Promise<Reservation[]> {
    const commercial = await this.userRepository.findOne({ where: { id: commercialId } });
    if (!commercial) {
      throw new NotFoundException(`Commercial avec l'ID ${commercialId} non trouvé`);
    }
  
    const currentDate = new Date();
  
    const reservations = await this.reservationRepository.find({
      where: {
        commercial: { id: commercialId },
        status: 'pending',
        startTime: LessThan(currentDate), 
      },
      relations: ['engineer', 'engineer.user', 'offre','offre.requiredSkills'], 
      order: { startTime: 'ASC' },
    });
  
    return reservations;
  }

  
}


