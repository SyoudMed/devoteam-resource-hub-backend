import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Not, Repository } from 'typeorm';
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

    const whereClause: any = {};
    
    if (commercialId) {
      whereClause.commercial = { id: commercialId };
    }


    if (status && ['accepted', 'rejected', 'pending'].includes(status)) {
      whereClause.status = status;
    }

    if (search) {
      whereClause.clientName = Like(`%${search}%`);
      whereClause.meetingPurpose = Like(`%${search}%`);
      whereClause.engineer = {
        user: [
          { email: Like(`%${search}%`) },
          { firstName: Like(`%${search}%`) },
          { lastName: Like(`%${search}%`) },
        ],
      };
    }

    try {
      const [reservations, total] = await this.reservationRepository.findAndCount({
        where: whereClause,
        relations: ['engineer', 'engineer.user', 'commercial', 'offre'], 
        skip,
        take: limit,
        order: { id: 'ASC' }, 
      });

      return {
        data: reservations,
        total,
        page,
        totalPages: Math.ceil(total / limit),
        limit,
      };
    } catch (error) {
      throw new BadRequestException('Erreur lors de la récupération des réservations paginées');
    }
  }

  async findPaginatedReservations({
    page,
    limit,
    search = '',
    status = '',
  }: PaginationParams): Promise<PaginatedResponse<Reservation>> {
    const skip = (page - 1) * limit;
  
    const whereConditions: any[] = [];
  
    if (status && ['accepted', 'rejected', 'pending'].includes(status)) {
      whereConditions.push({ status });
    }
  
    
    if (search) {
      whereConditions.push([
        { clientName: Like(`%${search}%`) },
        { meetingPurpose: Like(`%${search}%`) },
        {
          engineer: {
            user: [
              { email: Like(`%${search}%`) },
              { firstName: Like(`%${search}%`) },
              { lastName: Like(`%${search}%`) },
            ],
          },
        },
      ]);
    }
  
    try {
      const [reservations, total] = await this.reservationRepository.findAndCount({
        where: whereConditions.length > 0 ? whereConditions : {},
        relations: ['engineer', 'engineer.user', 'commercial', 'offre'],
        skip,
        take: limit,
        order: { id: 'ASC' },
      });
  
      return {
        data: reservations,
        total,
        page,
        totalPages: Math.ceil(total / limit),
        limit,
      };
    } catch (error) {
      throw new BadRequestException(
        'Erreur lors de la récupération des réservations paginées',
      );
    }
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
      relations: ['engineer', 'engineer.user', 'commercial', 'offre'],
    });

    if (!reservation) {
      throw new NotFoundException(`Réservation avec l'ID ${id} non trouvée`);
    }

    const engineer = reservation.engineer;
    const offre = reservation.offre;

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
      reservation.status = status;
      await this.offreRepository.save(offre);
      await this.reservationRepository.save(reservation); 
    } else if (status === 'rejected') {
      
      if (engineer.disponibiliteStatus === AvailabilityStatus.UNAVAILABLE) {
        engineer.disponibiliteStatus = AvailabilityStatus.AVAILABLE;
      }
      reservation.status = status;
      await this.reservationRepository.save(reservation);

      const existingAcceptedReservation = await this.reservationRepository.findOne({
        where: {
          offre: { id: offre.id },
          status: 'accepted',
        },
      });
      
      if (existingAcceptedReservation==null) {
        offre.status = OffreStatus.EN_ATTENTE;
        await this.offreRepository.save(offre);
      }
    } else {
      
      reservation.status = status;
      await this.reservationRepository.save(reservation); 
    }
    
    await this.engineerRepository.save(engineer);
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
      relations: ['engineer', 'engineer.user', 'commercial', 'offre'],
      order: { startTime: 'ASC' },
    });
  
    return reservations;
  }

  
}