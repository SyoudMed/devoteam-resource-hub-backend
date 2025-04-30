import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { Engineer } from 'src/engineer/entities/engineer.entity';

@Entity('skill') // explicitly match the table name in your DB
export class Skills {
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
