import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Offre } from './offre.entity';

@Entity()
export class OffreSkill {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  skill_name: string;

  @Column()
  category: string;

  @ManyToOne(() => Offre, (offre) => offre.requiredSkills, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'offre_id' })  
  offre: Offre;
}
