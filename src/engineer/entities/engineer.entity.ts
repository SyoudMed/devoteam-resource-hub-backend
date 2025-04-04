
import { User } from '../../users/entities/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, OneToMany } from 'typeorm';

import { Comment } from '../../comments/entities/comment.entity';
import { Reservation } from '../../Reservations/entities/reservation.entity';
export enum AvailabilityStatus {
  AVAILABLE = 'available',
  UNAVAILABLE = 'unavailable',
}
export enum Speciality {
  DEVELOPER = "Developer",
  DEVOPS = "DevOps",
  CYBER_SECURITY = "Cyber Security",
  DATA = "Data",
}

interface Skill {
  name: string;
  category: string;
}

// Interface pour typer les expériences
interface Experience {
  entreprise: string;
  poste: string;
  periode: string;
  responsabilities: string[];
}
@Entity()
export class Engineer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: AvailabilityStatus, default: AvailabilityStatus.AVAILABLE })
  disponibiliteStatus: AvailabilityStatus;

  @Column({ type: 'enum', enum: Speciality })
  speciality: Speciality;


  @Column({ type: 'int', name: 'total_experience_year' }) 
  totalExperienceYear: number;


  @Column()
  languages: string;

  @Column()
  poste: string;

  @Column('json', { nullable: true })
  skills: Skill[];

  @Column('json', { nullable: true })
  formations: string[];

  @Column('json', { nullable: true })
  experience: Experience[];

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' }) 
  user: User;

  @Column({ name: 'userId' }) 
  userId: number;

  @OneToMany(() => Comment, (comment) => comment.engineer)
  comments: Comment[];

  @OneToMany(() => Reservation, (reservation) => reservation.engineer, {
    onDelete: 'CASCADE'
  })
  reservations: Reservation[];

  @Column({ type: 'boolean', default: false }) 
  reservationStatus: boolean;


  @Column({ type: 'varchar', nullable: true })
  CvUrl?: string ;
}