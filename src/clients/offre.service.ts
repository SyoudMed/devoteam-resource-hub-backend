import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Offre, OffreStatus, Speciality } from './entities/offre.entity';
import { CreateOffreDto } from './dto/create-offre.dto';
import { UpdateOffreDto } from './dto/update-offre.dto';
import { User } from 'src/users/entities/user.entity';
import { Reservation } from 'src/Reservations/entities/reservation.entity';

@Injectable()
export class OffreService {
  constructor(
    @InjectRepository(Offre)
    private readonly offreRepository: Repository<Offre>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,
  ) {}

  async create(createOffreDto: CreateOffreDto): Promise<Offre> {
    const user = await this.userRepository.findOne({ where: { id: createOffreDto.createdById } });
    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }
    const offre = this.offreRepository.create({
      ...createOffreDto,
      status: OffreStatus.EN_ATTENTE,
      createdBy: user, 
    });

    return this.offreRepository.save(offre);
  }

  async findAll(): Promise<Offre[]> {
    return this.offreRepository.find();
  }

  async findAllPending(): Promise<Offre[]> {
    return this.offreRepository.find({
      where: { status: OffreStatus.EN_ATTENTE },
      relations: ['createdBy'], 
    });
  }

  async findOne(id: number): Promise<Offre> {
    const offre = await this.offreRepository.findOne({ where: { id } });
    if (!offre) {
      throw new NotFoundException(`Offre avec l'ID ${id} non trouvée`);
    }
    return offre;
  }

  async update(id: number, updateOffreDto: UpdateOffreDto): Promise<Offre> {
    const offre = await this.offreRepository.findOne({ where: { id } });

    if (!offre) {
      throw new NotFoundException(`Offre avec l'ID ${id} non trouvée`);
    }
    Object.assign(offre, updateOffreDto);
    return this.offreRepository.save(offre);
  }

  async remove(id: number): Promise<void> {
    const offre = await this.findOne(id); 
    await this.offreRepository.remove(offre);
  }

  async getOffersCountBySpeciality(): Promise<{ speciality: Speciality; count: number }[]> {
    const result = await this.offreRepository
      .createQueryBuilder('offre')
      .select('offre.requiredSpeciality', 'speciality')
      .addSelect('COUNT(*)', 'count')
      .groupBy('offre.requiredSpeciality')
      .getRawMany();

    return result.map((item) => ({
      speciality: item.speciality as Speciality,
      count: parseInt(item.count, 10),
    }));
  }

  async getOffersCountByStatus(): Promise<{ accepter: number; en_attente: number }> {
    const result = await this.offreRepository
      .createQueryBuilder('offre')
      .select('offre.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .where('offre.status IN (:...statuses)', { statuses: [OffreStatus.ACCEPTER, OffreStatus.EN_ATTENTE] })
      .groupBy('offre.status')
      .getRawMany();

    const counts = { accepter: 0, en_attente: 0 };
    result.forEach((item) => {
      if (item.status === OffreStatus.ACCEPTER) {
        counts.accepter = parseInt(item.count, 10);
      } else if (item.status === OffreStatus.EN_ATTENTE) {
        counts.en_attente = parseInt(item.count, 10);
      }
    });

    return counts;
  }

  
}