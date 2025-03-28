import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Engineer } from './entities/engineer.entity';
import { User } from 'src/users/entities/user.entity';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { AvailabilityStatus } from 'src/common/enum/AvailabilityStatus.enum';
import { MailService } from 'src/auth/mail.service';
import * as bcrypt from 'bcryptjs';
import { UpdateAvailabilityDto } from './dto/update-availability.dto';

@Injectable()
export class EngineerService {
  constructor(
    @InjectRepository(Engineer)
    private engineerRepository: Repository<Engineer>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private mailService: MailService
  ) {}

  async create(createEngineerDto: CreateUserDto): Promise<Engineer> {
    try {
    
      const existingUser = await this.userRepository.findOne({
        where: { email: createEngineerDto.email },
      });
      if (existingUser) {
        throw new BadRequestException('Email already exists');
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
      console.log("specialite :",createEngineerDto.speciality);
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
    } catch (error) {
      
      throw error;
    }
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
    const engineers = await this.engineerRepository.find({ relations: ['user'] });
    return engineers;
  }
  
  async updateAvailability(id: number, updateAvailabilityDto: UpdateAvailabilityDto): Promise<Engineer> {
    console.log(`Mise à jour de la disponibilité pour l'ID ${id}`, updateAvailabilityDto);
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
      throw new ConflictException('Ingénieur non trouvé');
    }
    if (engineer.user) {
      await this.userRepository.remove(engineer.user); 
    }
    await this.engineerRepository.remove(engineer);
    const response = { message: `Ingénieur avec l'ID ${id} supprimé avec succès` };
    console.log('Réponse backend :', response);
    return response;
  }

  
}
