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
    const isProduction = process.env.NODE_ENV === "production";
    const basePath = isProduction
      ? path.join(__dirname, "templates")
      : path.join(process.cwd(), "src", "mail", "templates");
    const templatePath = path.join(basePath, `${templateName}.html`);
    let template = fs.readFileSync(templatePath, "utf-8");

    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`\\\${${key}}`, "g"); 
      template = template.replace(regex, value);
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

  async sendAccountVerificationEmail(
    email: string,
    password: string, 
    verificationCode: string
  ): Promise<{ message: string }> {
    const verificationLink = `http://localhost:5173/verification?email=${encodeURIComponent(email)}`;
    const htmlContent = this.loadTemplate("account-verification", {
      email,
      password, 
      verificationCode,
      verificationLink,
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Vérification de votre compte",
      html: htmlContent,
    };

    await this.transporter.sendMail(mailOptions);
    return { message: `Email envoyé à ${email}` };
  }


  async sendReservationNotificationEmail(
    email: string,
    details: {
      engineerName: string;
      startTime: string;
      endTime: string;
      duration: string;
      clientName: string;
      meetingPurpose: string;
      offreTitle: string;
      commercialName: string;
    },
): Promise<{ message: string }> {
    const htmlContent = this.loadTemplate("reservation-notification", {
      engineerName: details.engineerName,
      startTime: details.startTime,
      endTime: details.endTime,
      duration: details.duration,
      clientName: details.clientName,
      meetingPurpose: details.meetingPurpose,
      offreTitle: details.offreTitle,
      commercialName: details.commercialName,
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Nouvelle réservation d\’entretien",
      html: htmlContent,
    };

    await this.transporter.sendMail(mailOptions);
    return { message: `Email envoyé à ${email}` };
  }
  async sendReservationCancellationEmail(
    email: string,
    details: {
      engineerName: string;
      startTime: string;
      endTime: string;
      clientName: string;
      meetingPurpose: string;
      commercialName: string;
    },
  ): Promise<{ message: string }> {
    const htmlContent = this.loadTemplate("reservation-cancellation", {
      engineerName: details.engineerName,
      startTime: details.startTime,
      endTime: details.endTime,
      clientName: details.clientName,
      meetingPurpose: details.meetingPurpose,
      commercialName: details.commercialName,
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Annulation de votre réservation",
      html: htmlContent,
    };

    await this.transporter.sendMail(mailOptions);
    return { message: `Email envoyé à ${email}` };
  }
}