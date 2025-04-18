import { User } from '../../users/entities/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, OneToMany } from 'typeorm';
import { Comment } from '../../comments/entities/comment.entity';
import { Reservation } from '../../Reservations/entities/reservation.entity';
import { Experience } from '../../experiences/entities/experience.entity'; 

export enum AvailabilityStatus {
  AVAILABLE = 'available',
  UNAVAILABLE = 'unavailable',
}

export enum Speciality {
  DEVELOPER = 'Developer',
  DEVOPS = 'DevOps',
  CYBER_SECURITY = 'Cyber Security',
  DATA = 'Data',
}

interface Skill {
  category: string;
  skills: string[];
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

  @Column({ type: 'json', nullable: true }) 
  languages: string[];

  @Column()
  poste: string;

  @Column('json', { nullable: true })
  skills: Skill[];

  @Column('json', { nullable: true })
  formations: string[];

  @OneToMany(() => Experience, (exp) => exp.engineer, { cascade: true, eager: true })
  experiences: Experience[];

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ name: 'userId' }) 
  userId: number;

  @OneToMany(() => Comment, (comment) => comment.engineer)
  comments: Comment[];

  @OneToMany(() => Reservation, (reservation) => reservation.engineer, { onDelete: 'CASCADE' })
  reservations: Reservation[];

  

  @Column({ type: 'varchar', nullable: true })
  CvUrl?: string;
}
