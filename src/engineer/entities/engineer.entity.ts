import { AvailabilityStatus } from 'src/common/enum/AvailabilityStatus.enum';
import { User } from '../../users/entities/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, OneToMany } from 'typeorm';
import { Speciality } from 'src/common/enum/Speciality.enum';
import { Comment } from '../../comments/entities/comment.entity';

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
}