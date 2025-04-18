import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Experience } from './entities/experience.entity';
import { Engineer } from '../engineer/entities/engineer.entity';


export class CreateExperienceDto {
  entreprise: string;
  poste: string;
  periode?: string;
  responsabilities: string[];
  engineerId: number;
}


export class UpdateExperienceDto {
  entreprise?: string;
  poste?: string;
  periode?: string;
  responsabilities?: string[];
}

@Injectable()
export class ExperienceService {
  constructor(
    @InjectRepository(Experience)
    private experienceRepository: Repository<Experience>,
    @InjectRepository(Engineer)
    private engineerRepository: Repository<Engineer>,
  ) {}

  // Créer une nouvelle expérience
  async create(createExperienceDto: CreateExperienceDto): Promise<Experience> {
    const { engineerId, ...experienceData } = createExperienceDto;

    const engineer = await this.engineerRepository.findOne({ where: { id: engineerId } });
    if (!engineer) {
      throw new NotFoundException(`Ingénieur avec l'ID ${engineerId} non trouvé`);
    }

    const experience = this.experienceRepository.create({
      ...experienceData,
      engineer,
    });

    return this.experienceRepository.save(experience);
  }

  // Récupérer toutes les expériences d'un ingénieur
  async findByEngineerId(engineerId: number): Promise<Experience[]> {
    const experiences = await this.experienceRepository.find({
      where: { engineer: { id: engineerId } },
      relations: ['engineer'],
    });

    if (!experiences.length) {
      throw new NotFoundException(`Aucune expérience trouvée pour l'ingénieur avec l'ID ${engineerId}`);
    }

    return experiences;
  }

  // Récupérer une expérience par son ID
  async findOne(id: number): Promise<Experience> {
    const experience = await this.experienceRepository.findOne({
      where: { id },
      relations: ['engineer'],
    });

    if (!experience) {
      throw new NotFoundException(`Expérience avec l'ID ${id} non trouvée`);
    }

    return experience;
  }

  // Mettre à jour une expérience
  async update(id: number, updateExperienceDto: UpdateExperienceDto): Promise<Experience> {
    const experience = await this.findOne(id);

    Object.assign(experience, updateExperienceDto);

    return this.experienceRepository.save(experience);
  }

  // Supprimer une expérience par son ID
  async delete(id: number): Promise<{ message: string }> {
    const experience = await this.findOne(id);
    await this.experienceRepository.remove(experience);
    return { message: `Expérience avec l'ID ${id} supprimée avec succès` };
  }

  // Supprimer toutes les expériences d'un ingénieur
  async deleteByEngineerId(engineerId: number): Promise<{ message: string }> {
    const engineer = await this.engineerRepository.findOne({ where: { id: engineerId } });
    if (!engineer) {
      throw new NotFoundException(`Ingénieur avec l'ID ${engineerId} non trouvé`);
    }

    const result = await this.experienceRepository.delete({ engineer: { id: engineerId } });

    if (result.affected === 0) {
      return { message: `Aucune expérience trouvée pour l'ingénieur avec l'ID ${engineerId}` };
    }

    return { message: `Expériences supprimées avec succès pour l'ingénieur avec l'ID ${engineerId}` };
  }
}
