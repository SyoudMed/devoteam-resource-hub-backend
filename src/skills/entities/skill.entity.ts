import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, ManyToMany } from 'typeorm';
import { Engineer } from '../../engineer/entities/engineer.entity';

@Entity()
export class Skill {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  skill_name: string;

  @Column()
  original_name: string;

  @Column()
  category: string;

  @ManyToMany(() => Engineer, (engineer) => engineer.skills)
engineers: Engineer[];


}
