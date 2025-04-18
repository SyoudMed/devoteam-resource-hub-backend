import { Controller, Post, Body } from "@nestjs/common";
import { MailService } from "./mail.service";

@Controller("mail")
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Post("reset-password")
  async sendResetPasswordEmail(
    @Body("email") email: string,
    @Body("resetPasswordCode") resetPasswordCode: string
  ): Promise<{ message: string }> {
    return this.mailService.sendResetPasswordEmail(email, resetPasswordCode);
  }

  @Post("account-verification")
  async sendAccountVerificationEmail(
    @Body("email") email: string,
    @Body("password") password: string,
    @Body("verificationCode") verificationCode: string
  ): Promise<{ message: string }> {
    return this.mailService.sendAccountVerificationEmail(email, password,verificationCode);
  }
}