
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Offre, OffreStatus } from './entities/offre.entity';
import { CreateOffreDto } from './dto/create-offre.dto';
import { UpdateOffreDto } from './dto/update-offre.dto';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class OffreService {
  constructor(
    @InjectRepository(Offre)
    private readonly offreRepository: Repository<Offre>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
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

  // Récupérer toutes les offres
  async findAll(): Promise<Offre[]> {
    return this.offreRepository.find();
  }

  // Récupérer une offre par ID
  async findOne(id: number): Promise<Offre> {
    const offre = await this.offreRepository.findOne({ where: { id } });
    if (!offre) {
      throw new NotFoundException(`Offre avec l'ID ${id} non trouvée`);
    }
    return offre;
  }


  async update(id: number, updateOffreDto: UpdateOffreDto): Promise<Offre> {
    const offre = await this.findOne(id);
    Object.assign(offre, updateOffreDto);
    return this.offreRepository.save(offre);
  }

  
  async remove(id: number): Promise<void> {
    const offre = await this.findOne(id); 
    await this.offreRepository.remove(offre);
  }
}