import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, In } from 'typeorm';
import { Engineer } from './entities/engineer.entity';
import { User } from 'src/users/entities/user.entity';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { AvailabilityStatus } from 'src/common/enum/AvailabilityStatus.enum';
import * as bcrypt from 'bcryptjs';
import { UpdateAvailabilityDto } from './dto/update-availability.dto';
import { UpdateEngineerProfileDto } from './dto/update-engineer-profile.dto';
import { v2 as cloudinary } from 'cloudinary';
import { Experience } from 'src/experiences/entities/experience.entity';
import { MailService } from 'src/mail/mail.service';
import { Skills } from 'src/skills/entities/skill.entity';
import { CreateEngineerDto } from './dto/create-engineer.dto';



@Injectable()
export class EngineerService {
  constructor(
    @InjectRepository(Engineer)
    private engineerRepository: Repository<Engineer>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Experience)
    private experienceRepository: Repository<Experience>,
    private mailService: MailService,
    @InjectRepository(Skills)
    private skillRepository: Repository<Skills>,
  ) {}


 



  async create(createEngineerDto: CreateUserDto): Promise<Engineer> {
    const existingUser = await this.userRepository.findOne({
      where: { email: createEngineerDto.email },
    });
    if (existingUser) {
      throw new ConflictException("Email déjà existant");
    }

    const hashedPassword = await bcrypt.hash(createEngineerDto.password, 10);

    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationCodeExpiration = Date.now() + 3600000;

    const user = this.userRepository.create({
      firstName: createEngineerDto.firstName,
      lastName: createEngineerDto.lastName,
      telephone: createEngineerDto.telephone,
      email: createEngineerDto.email,
      password: hashedPassword,
      role: createEngineerDto.role,
      verificationCode,
      verificationCodeExpiration,
      isVerified: false,
    });

    const savedUser = await this.userRepository.save(user);

    const engineer = this.engineerRepository.create({
      disponibiliteStatus: createEngineerDto.disponibiliteStatus || AvailabilityStatus.AVAILABLE,
      speciality: createEngineerDto.speciality,
      user: savedUser,
    });

    const savedEngineer = await this.engineerRepository.save(engineer);

    try {
      await this.mailService.sendAccountVerificationEmail(
        createEngineerDto.email,
        createEngineerDto.password, 
        verificationCode,
      );
    } catch (error) {
      await this.engineerRepository.remove(savedEngineer);
      await this.userRepository.remove(savedUser);
      throw new BadRequestException("Erreur lors de l'envoi de l'email de vérification");
    }

    return savedEngineer;
  }

  async findEngineerById(id: number): Promise<Engineer> {
    const engineer = await this.engineerRepository.findOne({
      where: { id },
      relations: ['user', 'experiences', 'comments'],
    });

    if (!engineer) {
      throw new NotFoundException(`Ingénieur avec l'ID ${id} non trouvé`);
    }

    return engineer;
  }



  private async uploadCvToCloudinary(file: Express.Multer.File, engineerId: number): Promise<string> {
    try {
      const publicId = `engineer_${engineerId}_${Date.now()}.pptx`;
      
      const result = await new Promise<any>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'engineer_cvs',
            public_id: publicId,
            resource_type: 'raw',
            overwrite: true,
          },
          (error, result) => {
            if (error) {
              console.error('Erreur Cloudinary:', error);
              reject(error);
            } else {
              resolve(result);
            }
          },
        );
        uploadStream.end(file.buffer); 
      });

    
      return result.secure_url;
    } catch (error) {
      
      throw new BadRequestException('Échec de l\'upload du CV vers Cloudinary');
    }
  }

  
  private extractPublicId(url: string): string | null {
    const parts = url.split('/');
    const fileName = parts.pop()?.split('.')[0];
    return fileName ? `engineer_cvs/${fileName}` : null;
  }

  async uploadEngineerCv(id: number, file: Express.Multer.File): Promise<Engineer> {
    
    const engineer = await this.engineerRepository.findOne({ where: { id } });
    if (!engineer) {
      throw new NotFoundException(`Ingénieur ${id} non trouvé`);
    }

    if (!file.mimetype.includes('presentationml.presentation')) {
      console.error('Type de fichier invalide:', file.mimetype);
      throw new BadRequestException('Seuls les fichiers PPTX sont acceptés');
    }

    if (file.size > 25 * 1024 * 1024) {
      throw new BadRequestException('Taille maximale: 25MB');
    }

    try {
      if (engineer.CvUrl) {
        const publicId = this.extractPublicId(engineer.CvUrl)+".pptx";
        if (publicId) {
      
          await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' })
            .catch((error) => console.error('Erreur lors de la suppression de l\'ancien CV:', error));
        }
      }

      const cvUrl = await this.uploadCvToCloudinary(file, id);

      await this.engineerRepository.update(id, { CvUrl: cvUrl });

      const updatedEngineer = await this.engineerRepository.findOneOrFail({ where: { id } });

      return updatedEngineer;
    } catch (error) {
      throw new BadRequestException(`Échec de l'upload: ${error.message}`);
    }
  }


  async updateProfile(
    id: number,
    updateEngineerProfileDto: UpdateEngineerProfileDto,
  ): Promise<Engineer> {
    const queryRunner = this.engineerRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const engineerRepository = queryRunner.manager.getRepository(Engineer);
      const skillRepository = queryRunner.manager.getRepository(Skills);
      const experienceRepository = queryRunner.manager.getRepository(Experience);

      // Récupérer l'ingénieur avec ses relations
      const engineer = await engineerRepository.findOne({
        where: { id },
        relations: ['user', 'experiences', 'skills'],
      });

      if (!engineer) {
        throw new NotFoundException(`Ingénieur avec l'ID ${id} non trouvé`);
      }

      // Mise à jour des champs simples
      engineer.poste = updateEngineerProfileDto.poste ?? engineer.poste;
      engineer.totalExperienceYear = updateEngineerProfileDto.totalExperienceYear ?? engineer.totalExperienceYear;
      engineer.languages = Array.isArray(updateEngineerProfileDto.languages)
        ? updateEngineerProfileDto.languages
        : engineer.languages || [];
      engineer.formations = updateEngineerProfileDto.formations ?? engineer.formations;

      // Associer les compétences (Many-to-Many)
      if (Array.isArray(updateEngineerProfileDto.skills)) {
        const skillEntities: Skills[] = [];

        for (const skillGroup of updateEngineerProfileDto.skills) {
          const { category, skills } = skillGroup;

          if (!category || !Array.isArray(skills) || skills.length === 0) {
            console.warn(`Groupe de compétences invalide: category=${category}, skills=${JSON.stringify(skills)}`);
            continue;
          }

          for (const skillName of skills) {
            if (!skillName || typeof skillName !== 'string' || skillName.trim() === '') {
              console.warn(`Compétence invalide: ${skillName}`);
              continue;
            }


            let skillEntity: Skills | null = await skillRepository.findOne({
              where: { skill_name: skillName.trim(), category: category.trim() },
            });

            if (!skillEntity) {
              skillEntity = skillRepository.create({
                skill_name: skillName.trim(),
                original_name: skillName.trim(), 
                category: category.trim(),
              });
              skillEntity = await skillRepository.save(skillEntity);
            } 

            if (!skillEntities.some((entity) => entity.id === skillEntity!.id)) {
              skillEntities.push(skillEntity);
            }
          }
        }

        // Supprimer les relations existantes dans engineer_skills
        const deleteResult = await queryRunner.manager
          .createQueryBuilder()
          .delete()
          .from('engineer_skills') 
          .where('engineer_id = :id', { id }) 
          .execute();

        // Vérifier que la table est vide pour cet ingénieur
        const currentRelations = await queryRunner.manager
          .createQueryBuilder()
          .select()
          .from('engineer_skills', 'relation')
          .where('relation.engineer_id = :id', { id })
          .getRawMany();
        if (currentRelations.length > 0) {
          console.error(`Relations non supprimées:`, currentRelations);
          throw new Error('Échec de la suppression des relations existantes');
        }

        engineer.skills = skillEntities;
      }

      // Enregistrer les modifications de l'ingénieur
      const updatedEngineer = await engineerRepository.save(engineer, { transaction: false });

      // Supprimer les anciennes expériences
      await queryRunner.manager.delete(Experience, { engineer: { id } });

      // Ajouter les nouvelles expériences
      if (Array.isArray(updateEngineerProfileDto.experience) && updateEngineerProfileDto.experience.length > 0) {
        for (const exp of updateEngineerProfileDto.experience) {
          const experience = experienceRepository.create({
            entreprise: exp.entreprise,
            poste: exp.poste,
            periode: exp.periode,
            responsabilities: exp.responsabilities,
            engineer: updatedEngineer,
          });
          await experienceRepository.save(experience);

        }
      }

      await queryRunner.commitTransaction();
      return updatedEngineer;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error(' Erreur lors de la mise à jour du profil:', error);
      throw new BadRequestException(`Erreur lors de la mise à jour du profil: ${error.message}`);
    } finally {
      await queryRunner.release();
    }
  }
  
  

  async findAllEngineers(): Promise<Engineer[]> {
    return this.engineerRepository.find({ relations: ['user', 'experiences'] });
  }



  async findPaginatedEngineers({
    page,
    limit,
    search = '',
    specialty = '',
  }: PaginationParams): Promise<PaginatedResponse<Engineer>> {
    const skip = (page - 1) * limit;

    const whereClause: any = {};
    if (search) {
      whereClause.user = [
        { firstName: Like(`%${search}%`) },
        { lastName: Like(`%${search}%`) },
        { email: Like(`%${search}%`) },
      ];
    }
    if (specialty) {
      whereClause.speciality = specialty;
    }

    try {
      const [engineers, total] = await this.engineerRepository.findAndCount({
        where: whereClause,
        relations: ['user', 'experiences'],
        skip,
        take: limit,
        order: { id: 'ASC' },
      });

      return {
        data: engineers,
        total,
        page,
        totalPages: Math.ceil(total / limit),
        limit,
      };
    } catch (error) {
      throw new BadRequestException('Erreur lors de la récupération des ingénieurs paginés');
    }
  }
  

  async updateAvailability(id: number, updateAvailabilityDto: UpdateAvailabilityDto): Promise<Engineer> {
    const engineer = await this.engineerRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!engineer) {
      throw new NotFoundException(`Ingénieur avec l'ID ${id} non trouvé`);
    }

    engineer.disponibiliteStatus = updateAvailabilityDto.disponibiliteStatus;
    return this.engineerRepository.save(engineer);
  }

  async delete(id: number): Promise<{ message: string }> {
    const engineer = await this.engineerRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!engineer) {
      throw new NotFoundException('Ingénieur non trouvé');
    }

    await this.userRepository.delete(engineer.user.id);
    await this.engineerRepository.remove(engineer);
    return { message: `Ingénieur avec l'ID ${id} supprimé avec succès` };
  }

  
  async findEngineerByUserId(userId: number): Promise<Engineer> {
    const engineer = await this.engineerRepository.findOne({
      where: { user: { id: userId } },
      relations: ['user', 'experiences'],
    });
    if (!engineer) {
      throw new NotFoundException(`Ingénieur avec l'userId ${userId} non trouvé`);
    }
    return engineer;
  }

  async getTotalEngineersCount(): Promise<number> {
    try {
      const count = await this.engineerRepository.count();
      return count;
    } catch (error) {
      throw new BadRequestException(
        'Erreur lors de la récupération du nombre total d\'ingénieurs',
      );
    }
  }
  
  async getAvailabilityCounts(): Promise<{ available: number; unavailable: number }> {
    try {
      const [availableCount, unavailableCount] = await Promise.all([
        this.engineerRepository.count({
          where: { disponibiliteStatus: AvailabilityStatus.AVAILABLE },
        }),
        this.engineerRepository.count({
          where: { disponibiliteStatus: AvailabilityStatus.UNAVAILABLE },
        }),
      ]);

      return {
        available: availableCount,
        unavailable: unavailableCount,
      };
    } catch (error) {
      throw new BadRequestException(
        'Erreur lors de la récupération des comptes de disponibilité des ingénieurs',
      );
    }
  }

}