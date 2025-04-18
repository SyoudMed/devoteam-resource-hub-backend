import { Injectable, ConflictException, NotFoundException, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcryptjs';
import { UpdateUserDto } from './dto/update-user.dto';
import { v2 as cloudinary } from 'cloudinary';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    try {
        const existingUser = await this.usersRepository.findOne({
            where: { email: createUserDto.email },
        });
        
        if (existingUser) {
            throw new BadRequestException('Cet email est déjà utilisé.');
        }
        if (!createUserDto.password || createUserDto.password.length < 8) {
            throw new BadRequestException('Le mot de passe doit contenir au moins 8 caractères.');
        }
        const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
        const user = this.usersRepository.create({
            ...createUserDto,
            password: hashedPassword,
        });
        const savedUser = await this.usersRepository.save(user);
        const { password, ...result } = savedUser;
        return result as User;
        
    } catch (error) {
        if (error instanceof BadRequestException || error instanceof BadRequestException) {
            throw error;
        }
        throw new InternalServerErrorException("Une erreur est survenue lors de la création de l'utilisateur");
    }
}


  async updateProfile(userId: number, updateProfileDto: UpdateUserDto, file?: Express.Multer.File): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }
    if (updateProfileDto.email && updateProfileDto.email !== user.email) {
      const existingUser = await this.usersRepository.findOne({
        where: { email: updateProfileDto.email },
      });
      if (existingUser && existingUser.id !== userId) {
        throw new ConflictException('Cet email est déjà utilisé par un autre utilisateur');
      }
    }
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.mimetype)) {
        throw new ConflictException('Type de fichier non supporté. Seuls JPEG, PNG et GIF sont acceptés.');
      }
      if (file.size > 5 * 1024 * 1024) {
        throw new ConflictException('La taille du fichier dépasse la limite de 5MB.');
      }
  
      const uploadResult = await this.uploadToCloudinary(file, userId);
      const oldProfilePhotoUrl = user.profilePhotoUrl;
      updateProfileDto.profilePhotoUrl = uploadResult.secure_url;
      await this.usersRepository.update(userId, updateProfileDto);
      if (oldProfilePhotoUrl) {
        const oldPublicId = this.extractPublicId(oldProfilePhotoUrl);
        if (oldPublicId) {
          cloudinary.uploader.destroy(`profile_photos/${oldPublicId}`).catch((err) => {
            console.error("Erreur lors de la suppression de l'ancienne image:", err);
          });
        }
      }
    } else {
      await this.usersRepository.update(userId, updateProfileDto);
    }
    const updatedUser = await this.usersRepository.findOne({ where: { id: userId } });
    return updatedUser as User;
  }


  private async uploadToCloudinary(file: Express.Multer.File, userId: number): Promise<any> {
    return cloudinary.uploader.upload(
      `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
      {
        folder: 'profile_photos',
        public_id: `user_${userId}_${Date.now()}`,
        resource_type: 'image',
      }
    );
  }


  async deleteUser(id: number): Promise<{ message: string }> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }
    await this.usersRepository.remove(user);
    return { message: `Utilisateur avec l'ID ${id} supprimé avec succès` };
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findById(id: number): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

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

  async changeactivation(userId: number): Promise<void> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }
    user.isVerified = true;
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

  async clearValidationCode(userId: number): Promise<void> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }
    user.verificationCode = null;
    user.verificationCodeExpiration = null;
    await this.usersRepository.save(user);
  }

  async updateIsFirstLogin(userId: number, isFirstLogin: boolean): Promise<void> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }
    user.isFirstLogin = isFirstLogin;
    await this.usersRepository.save(user);
  }

  async deleteProfilePhoto(userId: number): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    if (user.profilePhotoUrl) {
      const publicId = this.extractPublicId(user.profilePhotoUrl);
      if (publicId) {
        await cloudinary.uploader.destroy(`profile_photos/${publicId}`);
      }
      user.profilePhotoUrl = null;
      const updatedUser = await this.usersRepository.save(user);
      const { password, ...result } = updatedUser;
      return result as User;
    }

    const { password, ...result } = user;
    return result as User;
  }

  
  private extractPublicId(url: string): string | null {
    const parts = url.split('/');
    const fileName = parts.pop()?.split('.')[0];
    return fileName || null;
  }
}