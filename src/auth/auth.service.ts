// src/auth/auth.service.ts
import {  Injectable, UnauthorizedException ,NotFoundException ,BadRequestException} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { AuthResult } from './dto/AuthResult.dto';
import { MailService } from './mail.service';






@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private mailService: MailService
  
  ) {}


  async authenticate(loginDto: LoginDto): Promise<AuthResult> {
    const user = await this.validateUser(loginDto)
    if (!user) {
      throw new UnauthorizedException('Identifiants invalides');
    }
    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload);
    return {
      accessToken,
      id: user.id,
      email: user.email,
      role: user.role,
    };
  }


  
  async validateUser(loginDto: LoginDto) {
    const user = await this.usersService.findByEmail(loginDto.email);
    if (user) {
      const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
      if (isPasswordValid) {
        return {
          id: user.id,
          email: user.email,
          role: user.role,
        };
      }
    }
  
    throw new UnauthorizedException('Identifiants invalides');
  }
  


  async changePassword(userId: number, newPassword: string) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('Utilisateur non trouvé');
    }
    const newHashedPassword = await bcrypt.hash(newPassword, 10);
    console.log('New password hash:', newHashedPassword);
    await this.usersService.updatePassword(userId, newHashedPassword);
    console.log('Password updated in DB');
  }
  



  async resetPasswordRequest(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }
    const resetPasswordCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiration = Date.now() + 3600000; 
    await this.usersService.savePasswordResetCode(user.id, resetPasswordCode, expiration);
    await this.mailService.sendResetPasswordEmail(email, resetPasswordCode);
    return { message: 'Un email avec le code de réinitialisation a été envoyé.' };
  }





  async resetPasswordWithCode(email: string, resetPasswordCode: string, newPassword: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }
    if (user.resetCode !== resetPasswordCode) {
      throw new BadRequestException('Code de réinitialisation invalide');
    }
  
    if (user.resetCodeExpiration && user.resetCodeExpiration < Date.now()) {
      throw new BadRequestException('Le code de réinitialisation a expiré');
    }
    
    await this.changePassword(user.id,newPassword);
    await this.usersService.clearResetPasswordCode(user.id);
    return { message: 'Mot de passe réinitialisé avec succès.' };
  }
  
}