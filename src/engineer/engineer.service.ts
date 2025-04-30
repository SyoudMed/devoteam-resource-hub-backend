import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
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
import { Skill } from 'src/skills/entities/skill.entity';
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
    @InjectRepository(Skill)
    private skillRepository: Repository<Skill>,
    private mailService: MailService,
  ) {}

  async uploadEngineerFromCv(createEngineerDto: CreateEngineerDto) {
    try {
      const engineer = this.engineerRepository.create({
        poste: createEngineerDto.position,
        totalExperienceYear: createEngineerDto.total_experience_years,
        speciality: createEngineerDto.speciality, 
        languages: createEngineerDto.languages,
        formations: createEngineerDto.trainings,
        user: { id: 19 }, 
      });
  
      const savedEngineer = await this.engineerRepository.save(engineer);
  
      
      const skillEntities: Skill[] = [];
  
      for (const skill of createEngineerDto.skills) {
        let skillEntity = await this.skillRepository.findOne({
          where: { skill_name: skill.normalized },
        });
  
        if (!skillEntity) {
          skillEntity = this.skillRepository.create({
            skill_name: skill.normalized,
            original_name: skill.original,
            category: skill.category,
          });
          skillEntity = await this.skillRepository.save(skillEntity);
        }
  
        skillEntities.push(skillEntity);
      }
  
      
      savedEngineer.skills = skillEntities;
      await this.engineerRepository.save(savedEngineer);
  
      
      for (const exp of createEngineerDto.experiences) {
        const experience = this.experienceRepository.create({
          entreprise: exp.company,
          poste: exp.job_title,
          periode: exp.period,
          responsabilities: exp.responsibilities,
          engineer: savedEngineer,
        });
        await this.experienceRepository.save(experience);
      }
  
      return {
        message: 'Engineer created successfully from CV 🚀',
        engineer: savedEngineer,
      };
    } catch (error) {
      console.error('❌ Error in uploadEngineerFromCv:', error);
      throw new BadRequestException("Erreur lors de l'enregistrement de l'ingénieur depuis CV");
    }
  }
  

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
      relations: ['user', 'experiences', 'skills', 'comments'],
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
            if (error) reject(error);
            else resolve(result);
          },
        );
        uploadStream.end(file.buffer);
      });

      return result.secure_url;
    } catch (error) {
      throw new BadRequestException("Échec de l'upload du CV vers Cloudinary");
    }
  }

  private extractPublicId(url: string): string | null {
    const parts = url.split('/');
    const fileName = parts.pop()?.split('.')[0];
    return fileName ? `engineer_cvs/${fileName}` : null;
  }

  async uploadEngineerCv(id: number, file: Express.Multer.File): Promise<Engineer> {
    const engineer = await this.engineerRepository.findOne({ where: { id } });
    if (!engineer) throw new NotFoundException(`Ingénieur ${id} non trouvé`);

    if (!file.mimetype.includes('presentationml.presentation')) {
      throw new BadRequestException('Seuls les fichiers PPTX sont acceptés');
    }

    if (file.size > 25 * 1024 * 1024) {
      throw new BadRequestException('Taille maximale: 25MB');
    }

    try {
      if (engineer.CvUrl) {
        const publicId = this.extractPublicId(engineer.CvUrl) + '.pptx';
        if (publicId) {
          await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
        }
      }

      const cvUrl = await this.uploadCvToCloudinary(file, id);
      await this.engineerRepository.update(id, { CvUrl: cvUrl });

      return await this.engineerRepository.findOneOrFail({ where: { id } });
    } catch (error) {
      throw new BadRequestException(`Échec de l'upload: ${error.message}`);
    }
  }

  // async updateProfile(id: number, dto: UpdateEngineerProfileDto): Promise<Engineer> {
  //   const queryRunner = this.engineerRepository.manager.connection.createQueryRunner();
  //   await queryRunner.connect();
  //   await queryRunner.startTransaction();

  //   try {
  //     const engineer = await this.engineerRepository.findOne({
  //       where: { id },
  //       relations: ['user', 'experiences', 'skills'],
  //     });
  //     if (!engineer) throw new NotFoundException(`Ingénieur ${id} non trouvé`);

  //     engineer.poste = dto.poste ?? engineer.poste;
  //     engineer.totalExperienceYear = dto.totalExperienceYear ?? engineer.totalExperienceYear;
  //     engineer.languages = Array.isArray(dto.languages) ? dto.languages : engineer.languages;
  //     engineer.formations = dto.formations ?? engineer.formations;

  //     if (dto.skills && dto.skills.length > 0) {
  //       const updatedSkills = await Promise.all(dto.skills.map(async (skill) => {
  //         let skillEntity = await this.skillRepository.findOne({ where: { skill_name: skill.normalized } });
  //         if (!skillEntity) {
  //           skillEntity = this.skillRepository.create({
  //             skill_name: skill.normalized,
  //             original_name: skill.original,
  //             category: skill.category,
  //           });
  //           await this.skillRepository.save(skillEntity);
  //         }
  //         return skillEntity;
  //       }));
  //       engineer.skills = updatedSkills;
  //     }

  //     await queryRunner.manager.delete(Experience, { engineer: { id } });

  //     if (dto.experience && dto.experience.length > 0) {
  //       const newExperiences = dto.experience.map((expDto) =>
  //         this.experienceRepository.create({
  //           entreprise: expDto.entreprise,
  //           poste: expDto.poste,
  //           periode: expDto.periode,
  //           responsabilities: expDto.responsabilities,
  //           engineer,
  //         })
  //       );
  //       await queryRunner.manager.save(Experience, newExperiences);
  //     }

  //     const updated = await queryRunner.manager.save(Engineer, engineer);
  //     await queryRunner.commitTransaction();
  //     return updated;
  //   } catch (error) {
  //     await queryRunner.rollbackTransaction();
  //     throw new BadRequestException(`Erreur lors de la mise à jour du profil: ${error.message}`);
  //   } finally {
  //     await queryRunner.release();
  //   }
  // }

  async findAllEngineers(): Promise<Engineer[]> {
    return this.engineerRepository.find({ relations: ['user', 'experiences', 'skills'] });
  }

  async findPaginatedEngineers({
    page,
    limit,
    search = '',
    specialty = '',
  }: any): Promise<any> {
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

    const [engineers, total] = await this.engineerRepository.findAndCount({
      where: whereClause,
      relations: ['user', 'experiences', 'skills'],
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
  }

  async updateAvailability(id: number, dto: UpdateAvailabilityDto): Promise<Engineer> {
    const engineer = await this.engineerRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!engineer) throw new NotFoundException(`Ingénieur ${id} non trouvé`);
    engineer.disponibiliteStatus = dto.disponibiliteStatus;
    return this.engineerRepository.save(engineer);
  }

  async delete(id: number): Promise<{ message: string }> {
    const engineer = await this.engineerRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!engineer) throw new NotFoundException('Ingénieur non trouvé');
    await this.userRepository.delete(engineer.user.id);
    await this.engineerRepository.remove(engineer);
    return { message: `Ingénieur avec l'ID ${id} supprimé avec succès` };
  }

  async findEngineerByUserId(userId: number): Promise<Engineer> {
    const engineer = await this.engineerRepository.findOne({
      where: { user: { id: userId } },
      relations: ['user', 'experiences', 'skills'],
    });
    if (!engineer) throw new NotFoundException(`Ingénieur avec l'userId ${userId} non trouvé`);
    return engineer;
  }

  async getTotalEngineersCount(): Promise<number> {
    try {
      return await this.engineerRepository.count();
    } catch (error) {
      throw new BadRequestException('Erreur lors du comptage des ingénieurs');
    }
  }

  async getAvailabilityCounts(): Promise<{ available: number; unavailable: number }> {
    try {
      const [available, unavailable] = await Promise.all([
        this.engineerRepository.count({ where: { disponibiliteStatus: AvailabilityStatus.AVAILABLE } }),
        this.engineerRepository.count({ where: { disponibiliteStatus: AvailabilityStatus.UNAVAILABLE } }),
      ]);
      return { available, unavailable };
    } catch (error) {
      throw new BadRequestException('Erreur lors du comptage des disponibilités');
    }
  }
}
