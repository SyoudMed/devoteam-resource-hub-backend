
import { Controller, Post, Body, Put, UseGuards, Req, Param, Patch } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/Change-password.dto';
import { JwtAuthGuard } from './guards/auth.guard';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ValidateAccountDto } from './dto/Validation-account.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.authenticate(loginDto);
  }

/*
  @UseGuards(JwtAuthGuard)
  @Put('changePassword')
  async changePassword(@Body() changePasswordDto: ChangePasswordDto,
      @Req() req,) {
    return this.authService.changePassword(
      req.user.id,
      
      changePasswordDto.newPassword
      );

  }*/

  @Post('forgot-password')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.resetPasswordRequest(forgotPasswordDto.email);
  }

  
  @Put('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPasswordWithCode(
      resetPasswordDto.email,
      resetPasswordDto.resetPasswordCode,
      resetPasswordDto.newPassword,
    );
  }

  @Post('validate-account')
  async validateAccount(@Body() validateAccountDto: ValidateAccountDto) {
    return this.authService.validateAccount(validateAccountDto);
  }

  @Patch('change-password/:userId')
  async changePassword(
    @Param('userId') userId: number,
    @Body('currentPassword') currentPassword: string,
    @Body('newPassword') newPassword: string
  ) {
    return this.authService.changePasswordWithValidation(userId, currentPassword, newPassword);
  }


  

  }
