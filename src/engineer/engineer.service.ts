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
import { MailService } from 'src/auth/mail.service';
import * as bcrypt from 'bcryptjs';
import { UpdateAvailabilityDto } from './dto/update-availability.dto';
import { UpdateEngineerProfileDto } from './dto/update-engineer-profile.dto';



@Injectable()
export class EngineerService {
  constructor(
    @InjectRepository(Engineer)
    private engineerRepository: Repository<Engineer>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private mailService: MailService,
  ) {}

  async create(createEngineerDto: CreateUserDto): Promise<Engineer> {
    const existingUser = await this.userRepository.findOne({
      where: { email: createEngineerDto.email },
    });
    if (existingUser) {
      throw new BadRequestException('Email déjà existant');
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
      verificationCode: verificationCode,
      verificationCodeExpiration: verificationCodeExpiration,
      isVerified: false,
    });

    const savedUser = await this.userRepository.save(user);

    const engineer = this.engineerRepository.create({
      disponibiliteStatus: createEngineerDto.disponibiliteStatus || AvailabilityStatus.AVAILABLE,
      speciality: createEngineerDto.speciality,
      user: savedUser,
    });

    await this.mailService.sendAccountVerificationEmail(
      createEngineerDto.email,
      createEngineerDto.password,
      verificationCode,
    );

    return this.engineerRepository.save(engineer);
  }

  async findEngineerById(id: number): Promise<Engineer> {
    const engineer = await this.engineerRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!engineer) {
      throw new NotFoundException(`Ingénieur avec l'ID ${id} non trouvé`);
    }

    return engineer;
  }

  async findAllEngineers(): Promise<Engineer[]> {
    return await this.engineerRepository.find({ relations: ['user'] });
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
        relations: ['user'], 
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


  

  async updateProfile(id: number, updateEngineerProfileDto: UpdateEngineerProfileDto): Promise<Engineer> {
    const engineer = await this.engineerRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!engineer) {
      throw new NotFoundException(`Ingénieur avec l'ID ${id} non trouvé`);
    }

    // Mise à jour des champs avec les données du DTO
    Object.assign(engineer, {
      poste: updateEngineerProfileDto.poste ?? engineer.poste,
      totalExperienceYear: updateEngineerProfileDto.totalExperienceYear ?? engineer.totalExperienceYear,
      languages: updateEngineerProfileDto.languages ?? engineer.languages,
      skills: updateEngineerProfileDto.skills ?? engineer.skills,
      formations: updateEngineerProfileDto.formations ?? engineer.formations,
      experience: updateEngineerProfileDto.experience ?? engineer.experience,
    });

    return this.engineerRepository.save(engineer);
  }

  async findEngineerByUserId(userId: number): Promise<Engineer> {
    const engineer = await this.engineerRepository.findOne({
      where: { userId },
      relations: ["user"],
    });
    if (!engineer) {
      throw new NotFoundException(`Ingénieur avec l'userId ${userId} non trouvé`);
    }
    return engineer;
  }
}