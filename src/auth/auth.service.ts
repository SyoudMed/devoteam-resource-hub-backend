import {  Injectable, UnauthorizedException ,NotFoundException ,BadRequestException} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { AuthResult } from './dto/AuthResult.dto';
import { MailService } from './mail.service';
import { ValidateAccountDto } from './dto/Validation-account.dto';
import { User } from 'src/users/entities/user.entity';






@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private mailService: MailService
  
  ) {}


  async authenticate(loginDto: LoginDto): Promise<AuthResult> {
    const user = await this.validateUser(loginDto) as User;
  
    
    if (!user) {
        throw new UnauthorizedException('Identifiants invalides');
    }

    if (!user.isVerified) {
        throw new UnauthorizedException('Compte non activé. Veuillez valider votre email.');
    }

    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload);

    if (user.isFirstLogin) {
        return {
            accessToken,
            id: user.id,
            email: user.email,
            role: user.role,
            firstLogin: true,
        };
    }
    return {
        accessToken,
        id: user.id,
        email: user.email,
        role: user.role,
        firstLogin: false,
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
          isVerified: user.isVerified,
          isFirstLogin: user.isFirstLogin,
        };
      }
    }
  
    throw new UnauthorizedException('Identifiants invalides');
  }
  

  
  async changePasswordWithValidation(userId: number, currentPassword: string, newPassword: string) {
  

    
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('Utilisateur non trouvé');
    }

    
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('Le mot de passe actuel est incorrect');
    }

    
    const newHashedPassword = await bcrypt.hash(newPassword, 10);
    console.log('Nouveau mot de passe haché:', newHashedPassword);

  
    await this.usersService.updatePassword(userId, newHashedPassword);
    console.log('Mot de passe mis à jour dans la base de données');
    await this.usersService.updateIsFirstLogin(userId, false);
    console.log('Propriété isFirstLogin mise à jour à false');
    
    return { message: 'Mot de passe modifié avec succès.' };
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






  async validateAccount({ email, verificationCode }: ValidateAccountDto) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    if (user.verificationCode !== verificationCode) {
      throw new BadRequestException('Code de validation invalide');
    }

    if (user.verificationCodeExpiration && user.verificationCodeExpiration < Date.now()) {
      throw new BadRequestException('Le code de validation a expiré');
    }

    
    await this.usersService.changeactivation(user.id);
    await this.usersService.clearValidationCode(user.id);

    return { message: 'Compte validé avec succès.' };
}

  
}