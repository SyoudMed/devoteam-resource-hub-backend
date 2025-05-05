import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm';
import { Offre } from '../../clients/entities/offre.entity';
import { Engineer } from '../../engineer/entities/engineer.entity';

@Entity()
export class MatchingResult {
    @PrimaryGeneratedColumn()
    id: number;
  
    @ManyToOne(() => Engineer, { eager: false, onDelete: 'CASCADE' })
    engineer: Engineer;
  
    @ManyToOne(() => Offre, { eager: false, onDelete: 'CASCADE' })
    offre: Offre;
  
    @Column('float')
    score: number;
}