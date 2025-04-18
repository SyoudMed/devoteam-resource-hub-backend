import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Engineer } from '../../engineer/entities/engineer.entity';
import { Offre } from '../../clients/entities/offre.entity';


@Entity()
export class Reservation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  startTime: Date;

  @Column()
  endTime: Date;

  @Column({ type: 'int' })
  duration: number;

  @Column()
  clientName: string;

  @Column({ nullable: true })
  meetingPurpose: string;

  @Column({
    type: 'enum',
    enum: ['accepted', 'rejected', 'pending'],
    default: 'pending',
  })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Engineer, (engineer) => engineer.reservations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'engineer_id' })
  engineer: Engineer;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'commercial_id' })
  commercial: User;

  @ManyToOne(() => Offre, (offre) => offre.reservations, { onDelete: 'CASCADE' }) 
  @JoinColumn({ name: 'offre_id' })
  offre: Offre;

  
}