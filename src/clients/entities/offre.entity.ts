import { Reservation } from '../../Reservations/entities/reservation.entity';
import { User } from '../../users/entities/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';



export enum OffreStatus {
  EN_COURS = 'en cours',
  EN_ATTENTE = 'en attente',
}


export enum Speciality {
  DEVELOPER = 'Developer',
  DEVOPS = 'DevOps',
  CYBER_SECURITY = 'Cyber Security',
  DATA = 'Data',
}

@Entity()
export class Offre {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  clientName: string;

  @Column()
  experience: number;

  @Column()
  jobTitle: string;

  @Column({ type: 'date' }) 
  startDate: Date;

  @Column({ type: 'date' })
  endDate: Date;

  @Column({
    type: 'enum',
    enum: OffreStatus,
    default: OffreStatus.EN_ATTENTE, 
  })
  status: OffreStatus;

  @Column({ type: 'enum', enum: Speciality })
  requiredSpeciality: Speciality;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'createdById' }) 
  createdBy: User;

  @Column({ nullable: false }) 
  createdById: number;

  @Column({ type: 'json'}) 
  requiredSkills: string[];

  @OneToMany(() => Reservation, (reservation) => reservation.offre)
  reservations: Reservation[];
}