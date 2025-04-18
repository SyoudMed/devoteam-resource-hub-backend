import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReservationService } from './reservation.service';
import { Reservation } from './entities/reservation.entity';
import { User } from '../users/entities/user.entity';
import { Offre } from '../clients/entities/offre.entity';
import { Comment } from '../comments/entities/comment.entity';
import { Engineer } from '../engineer/entities/engineer.entity';
import { MailService } from '../mail/mail.service';
import { Experience } from 'src/experiences/entities/experience.entity';

describe('ReservationService Integration Test', () => {
  let service: ReservationService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        
        TypeOrmModule.forRoot({
                  type: 'mysql',
                  host: 'localhost',
                  port: 3306,
                  username: 'root',
                  password: '',
                  database: 'devoteam_resources_hub',
                  entities: [User, Engineer, Offre, Reservation, Comment, Experience],
                  synchronize: false,
                }),
                TypeOrmModule.forFeature([User, Engineer, Offre, Reservation, Comment, Experience]),
      ],
      providers: [
        ReservationService,
        {
          provide: MailService,
          useValue: {
            sendReservationNotificationEmail: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ReservationService>(ReservationService);
  });

  it('should retrieve paginated reservations', async () => {
    const result = await service.findPaginatedReservations({
      page: 1,
      limit: 5,
      search: 'syoud mohamed amine',
      status: '',
      commercialId: 30, 
    });

    console.log(result); 
    expect(result).toBeDefined();
    expect(Array.isArray(result.data)).toBe(true);
    expect(result.page).toBe(1);
    expect(result.limit).toBe(5);
  });
});
