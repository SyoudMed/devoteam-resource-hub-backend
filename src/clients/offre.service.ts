import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Offre, OffreStatus } from './entities/offre.entity';
import { CreateOffreDto } from './dto/create-offre.dto';
import { UpdateOffreDto } from './dto/update-offre.dto';
import { User } from 'src/users/entities/user.entity';
import { OffreSkill } from './entities/offre-skill.entity';

@Injectable()
export class OffreService {
  constructor(
    @InjectRepository(Offre)
    private readonly offreRepository: Repository<Offre>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(OffreSkill)
    private readonly offreSkillRepository: Repository<OffreSkill>,
  ) {}

  async create(createOffreDto: CreateOffreDto): Promise<Offre> {
    try {
      const user = await this.userRepository.findOne({
        where: { id: createOffreDto.createdById },
      });

      if (!user) throw new NotFoundException('Utilisateur non trouvé');

      const offre = this.offreRepository.create({
        clientName: createOffreDto.clientName,
        jobTitle: createOffreDto.jobTitle,
        startDate: createOffreDto.startDate,
        endDate: createOffreDto.endDate,
        experience: createOffreDto.experience,
        requiredSpeciality: createOffreDto.requiredSpeciality,
        languages: createOffreDto.languages,
        status: OffreStatus.EN_ATTENTE,
        createdBy: user,
      });

      const savedOffre = await this.offreRepository.save(offre);

      if (createOffreDto.requiredSkills?.length) {
        const skills = createOffreDto.requiredSkills.map((skill) =>
          this.offreSkillRepository.create({
            skill_name: skill.skill_name,
            category: skill.category,
            offre: savedOffre,
          }),
        );
        await this.offreSkillRepository.save(skills);
      }

      return this.findOne(savedOffre.id);
    } catch (error) {
      console.error('Erreur lors de la création de l\'offre :', error);
      throw new InternalServerErrorException('Erreur interne lors de la création de l\'offre');
    }
  }

  async findAll(): Promise<Offre[]> {
    try {
      return await this.offreRepository.find({
        relations: ['createdBy', 'requiredSkills', 'reservations'],
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des offres :', error);
      throw new InternalServerErrorException('Impossible de récupérer les offres');
    }
  }

  async findAllPending(): Promise<Offre[]> {
    try {
      return await this.offreRepository.find({
        where: { status: OffreStatus.EN_ATTENTE },
        relations: ['createdBy', 'requiredSkills', 'reservations'],
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des offres en attente :', error);
      throw new InternalServerErrorException('Impossible de récupérer les offres en attente');
    }
  }

  async findOne(id: number): Promise<Offre> {
    try {
      const offre = await this.offreRepository.findOne({
        where: { id },
        relations: ['createdBy', 'requiredSkills', 'reservations'],
      });

      if (!offre) {
        throw new NotFoundException(`Offre avec l'ID ${id} non trouvée`);
      }

      return offre;
    } catch (error) {
      console.error(`Erreur lors de la récupération de l'offre ${id} :`, error);
      throw error instanceof NotFoundException ? error : new InternalServerErrorException();
    }
  }

  async update(id: number, updateOffreDto: UpdateOffreDto): Promise<Offre> {
    try {
      const offre = await this.findOne(id);
      Object.assign(offre, updateOffreDto);
      return await this.offreRepository.save(offre);
    } catch (error) {
      console.error(`Erreur lors de la mise à jour de l'offre ${id} :`, error);
      throw new InternalServerErrorException('Erreur lors de la mise à jour');
    }
  }

  async remove(id: number): Promise<void> {
    try {
      const offre = await this.findOne(id);
      await this.offreRepository.remove(offre);
    } catch (error) {
      console.error(`Erreur lors de la suppression de l'offre ${id} :`, error);
      throw new InternalServerErrorException('Erreur lors de la suppression');
    }
  }
}
