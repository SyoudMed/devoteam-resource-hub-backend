import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Engineer } from '../../engineer/entities/engineer.entity';
import { User } from '../../users/entities/user.entity';


export enum SuggestiontType {
  TRAINING = 'training',
  SKILL = 'skill',
  EXPERIENCE = 'experience',
  GENERAL = 'general',
}

@Entity()
export class Suggestion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  content: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  date: Date;

  @Column({
    type: 'enum',
    enum: SuggestiontType,
    default: SuggestiontType.GENERAL,
  })
  type: SuggestiontType;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'authorId' })
  author: User;

  @ManyToOne(() => Engineer, (engineer) => engineer.suggestions, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'engineerId' })
  engineer: Engineer;
}