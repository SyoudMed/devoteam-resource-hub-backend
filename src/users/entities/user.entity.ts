
import { Engineer } from '../../engineer/entities/engineer.entity';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn } from 'typeorm';

export enum UserRole {
  MANAGER = 'MANAGER',
  INGENIEUR = 'INGENIEUR',
  COMMERCIAL = 'COMMERCIAL',
}
@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  telephone: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ type: 'enum', enum: UserRole })
  role: UserRole;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  resetCode: string | null;

  @Column({ type: 'bigint', nullable: true })
  resetCodeExpiration: number | null;

  @Column({ type: 'varchar', length: 6, nullable: true })
  verificationCode: string | null;

  @Column({ type: 'bigint', nullable: true })
  verificationCodeExpiration: number | null;

  @Column({ default: false })
  isVerified: boolean;

  @Column({ default: true })
  isFirstLogin: boolean;

  @Column({ type: 'varchar', nullable: true })
  profilePhotoUrl?: string | null;

  
}