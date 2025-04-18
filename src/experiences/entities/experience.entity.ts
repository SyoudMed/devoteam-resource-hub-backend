import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Engineer } from '../../engineer/entities/engineer.entity';

@Entity()
export class Experience {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  entreprise: string;

  @Column()
  poste: string;

  @Column({ nullable: true })
  periode: string;

  @Column('json') 
  responsabilities: string[];
  

  @ManyToOne(() => Engineer, (engineer) => engineer.experiences, { onDelete: 'CASCADE' ,nullable: false})
  @JoinColumn({ name: 'engineerId' })
  engineer: Engineer;
}