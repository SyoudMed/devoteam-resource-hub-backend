import { Injectable } from "@nestjs/common";
import * as nodemailer from "nodemailer";
import * as fs from "fs";
import * as path from "path";

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  private loadTemplate(templateName: string, variables: Record<string, string>): string {
    const templatePath = path.join(__dirname, 'templates', 'account-verification.html'); 
    let template = fs.readFileSync(templatePath, "utf-8");

    for (const [key, value] of Object.entries(variables)) {
      template = template.replace(new RegExp(`{{${key}}}`, "g"), value);
    }

    return template;
  }

  async sendResetPasswordEmail(email: string, resetPasswordCode: string): Promise<{ message: string }> {
    const resetLink = `http://localhost:5173/modifier-password?email=${encodeURIComponent(email)}`;

    const htmlContent = this.loadTemplate("reset-password", { resetPasswordCode, resetLink });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Réinitialisation de votre mot de passe",
      html: htmlContent,
    };

    await this.transporter.sendMail(mailOptions);
    return { message: `Email envoyé à ${email}` };
  }

  async sendAccountVerificationEmail(email: string, password: string, verificationCode: string): Promise<{ message: string }> {
    const verificationLink = `http://localhost:5173/verification?email=${encodeURIComponent(email)}`;

    const htmlContent = this.loadTemplate("account-verification", { email, password, verificationCode, verificationLink });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Vérification de votre compte",
      html: htmlContent,
    };

    await this.transporter.sendMail(mailOptions);
    return { message: `Email envoyé à ${email}` };
  }
}
