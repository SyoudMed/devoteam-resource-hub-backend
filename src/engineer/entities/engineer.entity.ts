
import { AvailabilityStatus } from 'src/common/enum/AvailabilityStatus.enum';
import { User } from '../../users/entities/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';

@Entity()
export class Engineer {
    @PrimaryGeneratedColumn()
    id: number;


    

    @Column({ type: 'enum', enum: AvailabilityStatus, default: AvailabilityStatus.AVAILABLE })
    disponibiliteStatus: AvailabilityStatus;
/*
    @Column({ type: 'date', nullable: true })
    disponibiliteDateDebut: Date | null;

    @Column({ type: 'date', nullable: true })
    disponibiliteDateFin: Date | null; 
*/

    @OneToOne(() => User, (user) => user.engineerProfile)
    @JoinColumn()
    user: User;
}