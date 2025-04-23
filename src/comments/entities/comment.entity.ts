import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Engineer } from '../../engineer/entities/engineer.entity';
import { User } from '../../users/entities/user.entity';

// Enum pour les types de commentaire
export enum CommentType {
  TRAINING = 'training',
  SKILL = 'skill',
  EXPERIENCE = 'experience',
  GENERAL = 'general',
}

@Entity()
export class Comment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  content: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  date: Date;

  @Column({
    type: 'enum',
    enum: CommentType,
    default: CommentType.GENERAL,
  })
  type: CommentType;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'authorId' })
  author: User;

  @ManyToOne(() => Engineer, (engineer) => engineer.comments, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'engineerId' })
  engineer: Engineer;
}