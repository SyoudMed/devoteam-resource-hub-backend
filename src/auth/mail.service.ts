import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({ 
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: 'daija.jerde87@ethereal.email',
        pass: 'bnctF2ReSnVvQFkFa4'
      }
    });
  }

  async sendResetPasswordEmail(email: string, resetPasswordCode: string):Promise<{ message: string }> {
    const resetLink = `http://localhost:5173/modifier-password`;
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Réinitialisation de votre mot de passe',
      html: `
        <p>Bonjour,</p>
        <p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
        <p>Utilisez le code suivant : <strong>${resetPasswordCode}</strong></p>
        <p>Ou cliquez sur le lien ci-dessous pour réinitialiser directement votre mot de passe :</p>
        <a href="${resetLink}" style="color: blue; text-decoration: underline;">Réinitialiser mon mot de passe</a>
        <p>Si vous n'avez pas fait cette demande, ignorez cet email.</p>
      `,
    };

    try {
      
      await this.transporter.sendMail(mailOptions);
      console.log(`Email envoyé à ${email}`);

      
      return { message: 'Email envoyé avec succès à ' + email };
    } catch (error) {
      console.error(`Erreur lors de l'envoi de l'email à ${email}:`, error);
      throw new Error('Échec de l\'envoi de l\'email');
    }
  }
}
