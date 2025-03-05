import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcryptjs';
import { CreateUserDto } from './dto/create-user.dto';
import { UserRole } from 'src/common/enum/UserRole.enum';
import { UpdateUserDto } from './dto/update-user.dto';
import { Engineer } from 'src/engineer/entities/engineer.entity';
import { AvailabilityStatus } from 'src/common/enum/AvailabilityStatus.enum'; 
import { validate } from 'class-validator';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Engineer)
    private engineerRepository: Repository<Engineer>,
  ) {}
  async createUser(createUserDto: CreateUserDto): Promise<User> {
    
    const existingUser = await this.usersRepository.findOne({
      where: { email: createUserDto.email },
    });
    if (existingUser) {
      throw new ConflictException('Cet email est déjà utilisé.');
    }
  
    
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
  
    
    const user = this.usersRepository.create({
      firstName: createUserDto.firstName,
      lastName: createUserDto.lastName,
      telephone: createUserDto.telephone,
      email: createUserDto.email,
      password: hashedPassword,
      role: createUserDto.role,
    });
  
    
    const savedUser = await this.usersRepository.save(user);
  
    
    if (createUserDto.role === UserRole.INGENIEUR) {
      const engineer = this.engineerRepository.create({
        disponibiliteStatus: AvailabilityStatus.AVAILABLE,
        user: savedUser, 
      });
      savedUser.engineerProfile = engineer;
      await this.engineerRepository.save(engineer); 
      await this.usersRepository.save(savedUser); 
    }

    

    
  
    return savedUser;
  }
  



/* creer un user 
  async createUser(createUserDto: CreateUserDto): Promise<User> {
    
    if (createUserDto.role === UserRole.MANAGER) {
      throw new ConflictException("Vous ne pouvez pas créer un compte avec le rôle 'manager'.");
    }
    const existing = await this.usersRepository.findOne({ where: { email: createUserDto.email } });
    if (existing) {
      throw new ConflictException('Cet email est déjà utilisé.');
    }
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = this.usersRepository.create({
      email: createUserDto.email,
      password: hashedPassword,
      role: createUserDto.role,
      
    });

    return this.usersRepository.save(user);
  }
*/

  /* update user */
/*
  async updateUser(id : number , updateUserDto :UpdateUserDto):Promise<User>{
    const user = await this.usersRepository.findOne({where:{id}});
    if(!user){
      throw new ConflictException('User not found');
    }
    const updatedUser = Object.assign(user, updateUserDto);
    return this.usersRepository.save(updatedUser);
  }
*/

  

  
  
/* supprimer un utilisateur */
  async deleteUser(id :number):Promise<void>{
    const user = await this.usersRepository.findOne({where:{id}});
    if(!user){
      throw new ConflictException('User not found');
    }
    await this.usersRepository.remove(user);

  }


  /* routourner tout les users */

  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }


  /* find user by email */

  async findByEmail(email: string): Promise<User | null> {
    return await this.usersRepository.findOne({ where: { email } });
  }
  

  /* find user by id */

  async findById(id: number): Promise<User | null> {
    return await this.usersRepository.findOne({ where: { id } });
  }
  


/* update password */
  async updatePassword(userId: number, newPassword: string): Promise<void> {
  
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }    
    user.password = newPassword;
    await this.usersRepository.save(user);
  }



  

  async savePasswordResetCode(userId: number, resetCode: string, expiration: number): Promise<void> {
    
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }
    user.resetCode = resetCode;
    user.resetCodeExpiration = expiration;
    await this.usersRepository.save(user);
  }




  async clearResetPasswordCode(userId: number): Promise<void> {
  
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }
    user.resetCode = null;
    user.resetCodeExpiration = null;
    await this.usersRepository.save(user);
  }
  
  
}
