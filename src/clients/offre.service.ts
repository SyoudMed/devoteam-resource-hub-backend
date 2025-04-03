// src/offres/offre.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Offre, OffreStatus } from './entities/offre.entity';
import { CreateOffreDto } from './dto/create-offre.dto';
import { UpdateOffreDto } from './dto/update-offre.dto';

@Injectable()
export class OffreService {
  constructor(
    @InjectRepository(Offre)
    private offreRepository: Repository<Offre>,
  ) {}

  // Créer une nouvelle offre
  async create(createOffreDto: CreateOffreDto): Promise<Offre> {
    const offre = this.offreRepository.create({
      ...createOffreDto,
      status:OffreStatus.EN_ATTENTE, 
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