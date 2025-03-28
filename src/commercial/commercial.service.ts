import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { MailService } from 'src/auth/mail.service';
import { UserRole } from 'src/common/enum/UserRole.enum';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UpdateUserDto } from 'src/users/dto/update-user.dto';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';


@Injectable()
export class CommercialService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private mailService: MailService,
  ) {}


  async createCommercial(createUserDto: CreateUserDto): Promise<User> {

    const existingUser = await this.userRepository.findOne({ where: { email:createUserDto.email } });
    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }

    
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

  
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationCodeExpiration = new Date();
    verificationCodeExpiration.setHours(verificationCodeExpiration.getHours() + 1); 

    
    const newUser = this.userRepository.create({
      firstName: createUserDto.firstName,
      lastName: createUserDto.lastName,
      telephone: createUserDto.telephone,
      email: createUserDto.email,
      password: hashedPassword,
      role: UserRole.COMMERCIAL, 
      verificationCode,
      verificationCodeExpiration: verificationCodeExpiration.getTime(),  
      isVerified: false, 
    });
    await this.mailService.sendAccountVerificationEmail(
      createUserDto.email,
      createUserDto.password,
      verificationCode,
    );
    return this.userRepository.save(newUser);  
  }

  async getAllCommercials(): Promise<User[]> {
    return this.userRepository.find({
      where: { role: UserRole.COMMERCIAL }, 
    });
  }


  

  
  async updateCommercial(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id, role: UserRole.COMMERCIAL } });
    if (!user) {
      throw new ConflictException('commercial non trouvé');
    }
    Object.assign(user, updateUserDto);
    return this.userRepository.save(user);
  }


  async deleteCommercial(id: number):  Promise<{ message: string }> {
    const user = await this.userRepository.findOne({ where: { id, role: UserRole.COMMERCIAL } });
    if (!user) {
      throw new ConflictException('commercial non trouvé');
    }
    await this.userRepository.remove(user);
    const response = { message: `Commercial  supprimé avec succès` };
    return response;
  }



}
