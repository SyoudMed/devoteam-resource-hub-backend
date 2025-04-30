import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EngineerService } from './engineer.service';
import { Engineer } from './entities/engineer.entity';
import { User } from '../users/entities/user.entity';
import { Experience } from '../experiences/entities/experience.entity';
import { Comment } from '../comments/entities/comment.entity';
import { Reservation } from '../Reservations/entities/reservation.entity';
import { Offre } from '../clients/entities/offre.entity';
import { MailService } from '../mail/mail.service';
import { BadRequestException } from '@nestjs/common';
//badlet el esm mtaa el bd
jest.setTimeout(30000); // Avoid CI timeout

describe('EngineerService - findPaginatedEngineers', () => {
  let service: EngineerService;
  let module: TestingModule;

  const mockMailService = {
    sendMail: jest.fn().mockResolvedValue(true),
  };

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'mysql',
          host: 'localhost',
          port: 3306,
          username: 'root',
          password: '',
          database: 'test_devoteam_resources_hub', // ✅ MATCH THE CI DB
          entities: [Engineer, User, Experience, Comment, Reservation, Offre],
          synchronize: true, // Optional: helps in CI
        }),
        TypeOrmModule.forFeature([Engineer, User, Experience, Comment, Reservation, Offre]),
      ],
      providers: [
        EngineerService,
        { provide: MailService, useValue: mockMailService },
      ],
    }).compile();

    service = module.get<EngineerService>(EngineerService);
  });

  afterAll(async () => {
    if (module) {
      await module.close();
    }
  });

  describe('findPaginatedEngineers', () => {
    it('should return paginated engineers with no filters', async () => {
      const result = await service.findPaginatedEngineers({
        page: 1,
        limit: 3,
        search: 'ali@example.com',
        specialty: '',
      });

      console.log(
        'ingénieurs (no filters):',
        JSON.stringify(result.data.map(engineer => engineer.user), null, 2)
      );

      expect(result).toHaveProperty('data');
      expect(Array.isArray(result.data)).toBe(true);
      expect(result).toHaveProperty('total');
      expect(typeof result.total).toBe('number');
      expect(result.page).toBe(1);
      expect(result.limit).toBe(3);
      expect(result).toHaveProperty('totalPages');
      expect(typeof result.totalPages).toBe('number');

      if (result.data.length > 0) {
        expect(result.data[0]).toHaveProperty('user');
      }
    });

    it('should throw BadRequestException for invalid page', async () => {
      await expect(
        service.findPaginatedEngineers({
          page: 0,
          limit: 10,
          search: '',
          specialty: '',
        })
      ).rejects.toThrow(BadRequestException);
    });
  });
});
