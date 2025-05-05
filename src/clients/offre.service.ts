import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Offre, OffreStatus, Speciality } from './entities/offre.entity';
import { CreateOffreDto } from './dto/create-offre.dto';
import { UpdateOffreDto } from './dto/update-offre.dto';
import { User } from 'src/users/entities/user.entity';
import { Reservation } from 'src/Reservations/entities/reservation.entity';
import { OffreSkill } from './entities/offre-skill.entity';

@Injectable()
export class OffreService {
  constructor(
    @InjectRepository(Offre)
    private readonly offreRepository: Repository<Offre>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,
    @InjectRepository(OffreSkill)
    private readonly offreSkillRepository: Repository<OffreSkill>,
  ) {}

  async create(createOffreDto: CreateOffreDto): Promise<Offre> {
    try {
      const user = await this.userRepository.findOne({
        where: { id: createOffreDto.createdById },
      });

      if (!user) {
        throw new NotFoundException('Utilisateur non trouvé');
      }

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
    const queryRunner = this.offreRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
  
    try {
      const offreRepository = queryRunner.manager.getRepository(Offre);
      const offreSkillRepository = queryRunner.manager.getRepository(OffreSkill);

      const offre = await offreRepository.findOne({
        where: { id },
        relations: ['requiredSkills'],
      });
  
      if (!offre) {
        throw new NotFoundException(`Offre avec l'ID ${id} non trouvée`);
      }
  
      Object.assign(offre, updateOffreDto);
  
      if (updateOffreDto.requiredSkills) {
        await queryRunner.manager
          .createQueryBuilder()
          .delete()
          .from('offre_skill')
          .where('offre_id = :id', { id })
          .execute();

        const remainingSkills = await queryRunner.manager
          .createQueryBuilder()
          .select()
          .from('offre_skill', 'skill')
          .where('skill.offre_id = :id', { id })
          .getRawMany();
  
        if (remainingSkills.length > 0) {
          throw new Error('Échec de la suppression des anciennes compétences');
        }
  
        const newSkills = updateOffreDto.requiredSkills.map(skill => 
          offreSkillRepository.create({
            skill_name: skill.skill_name,
            category: skill.category,
            offre: { id } 
          })
        );
  
        await offreSkillRepository.save(newSkills);
        offre.requiredSkills = newSkills;
      }
      const updatedOffre = await offreRepository.save(offre);
      await queryRunner.commitTransaction();
      
      return updatedOffre;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error(`Erreur lors de la mise à jour de l'offre ${id}:`, error);
      throw new InternalServerErrorException(
        error instanceof NotFoundException 
          ? error.message 
          : 'Erreur lors de la mise à jour de l\'offre'
      );
    } finally {
      await queryRunner.release();
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

  async getOffersCountBySpeciality(): Promise<{ speciality: Speciality; count: number }[]> {
    try {
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
    } catch (error) {
      console.error('Erreur lors du comptage des offres par spécialité :', error);
      throw new InternalServerErrorException('Erreur lors du comptage des offres par spécialité');
    }
  }

  async getOffersCountByStatus(): Promise<{ en_cours: number; en_attente: number }> {
    try {
      const result = await this.offreRepository
        .createQueryBuilder('offre')
        .select('offre.status', 'status')
        .addSelect('COUNT(*)', 'count')
        .where('offre.status IN (:...statuses)', { statuses: [OffreStatus.ACCEPTER, OffreStatus.EN_ATTENTE] })
        .groupBy('offre.status')
        .getRawMany();

      const counts = { en_cours: 0, en_attente: 0 };
      result.forEach((item) => {
        if (item.status === OffreStatus.ACCEPTER) {
          counts.en_cours = parseInt(item.count, 10);
        } else if (item.status === OffreStatus.EN_ATTENTE) {
          counts.en_attente = parseInt(item.count, 10);
        }
      });

      return counts;
    } catch (error) {
      console.error('Erreur lors du comptage des offres par statut :', error);
      throw new InternalServerErrorException('Erreur lors du comptage des offres par statut');
    }
  }
}