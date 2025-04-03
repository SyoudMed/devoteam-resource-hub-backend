
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
@Entity()
export class Engineer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: AvailabilityStatus, default: AvailabilityStatus.AVAILABLE })
  disponibiliteStatus: AvailabilityStatus;

  @Column({ type: 'varchar', length: 255 })
  speciality: Speciality;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn() 
  user: User;

  @OneToMany(() => Comment, (comment) => comment.engineer)
  comments: Comment[];

  @OneToMany(() => Reservation, (reservation) => reservation.engineer, {
    onDelete: 'CASCADE'
  })
  reservations: Reservation[];

  @Column({ type: 'boolean', default: false }) 
  reservationStatus: boolean;
}