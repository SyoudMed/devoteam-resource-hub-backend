import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { BadRequestException, InternalServerErrorException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { UserRole } from 'src/common/enum/UserRole.enum';


jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashedPassword'),
}));

describe('UsersService Integration', () => {
  let service: UsersService;
  let userRepository: Repository<User>;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'mysql',
          host: 'localhost',
          port: 3306,
          username: 'root',
          password: '',
          database: 'test_devoteam_resources_hub',
          entities: [User],
          synchronize: true,
        }),
        TypeOrmModule.forFeature([User]),
      ],
      providers: [UsersService],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  }, 10000);

  beforeEach(async () => {
    await userRepository.query('DELETE FROM user');
  });

  afterAll(async () => {
    await module.close();
  });

  describe('createUser', () => {
    const createUserDto: CreateUserDto = {
      email: 'test@example.com',
      password: 'password123',
      role: UserRole.INGENIEUR,
      telephone: '1234567890',
      firstName: 'John',
      lastName: 'Doe',
    };

    it('devrait créer un utilisateur avec succès', async () => {
      const result = await service.createUser(createUserDto);

      expect(result).toBeDefined();
      expect(result.email).toEqual(createUserDto.email);
      expect(result.role).toEqual(createUserDto.role);
      expect(result.firstName).toEqual(createUserDto.firstName);
      expect(result.lastName).toEqual(createUserDto.lastName);
      expect(result.password).toBeUndefined();
      expect(bcrypt.hash).toHaveBeenCalledWith(createUserDto.password, 10);

      const savedUser = await userRepository.findOne({ where: { email: createUserDto.email } });
      expect(savedUser).toBeDefined();
      expect(savedUser?.email).toEqual(createUserDto.email);
      expect(savedUser?.password).toEqual('hashedPassword');
    });

    it('devrait lever une BadRequestException si l\'email existe déjà', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      const existingUser = userRepository.create({
        email: createUserDto.email,
        password: hashedPassword,
        role: UserRole.INGENIEUR,
        telephone: '1234567890',
        firstName: 'John',
        lastName: 'Doe',
      });
      await userRepository.save(existingUser);

      await expect(service.createUser(createUserDto)).rejects.toThrow(
        new BadRequestException('Cet email est déjà utilisé.'),
      );
    });

    it('devrait lever une BadRequestException si le mot de passe est trop court', async () => {
      const invalidUserDto: CreateUserDto = {
        ...createUserDto,
        password: 'short',
      };

      await expect(service.createUser(invalidUserDto)).rejects.toThrow(
        new BadRequestException('Le mot de passe doit contenir au moins 8 caractères.'),
      );
    });

    it('devrait lever une InternalServerErrorException en cas d\'erreur interne', async () => {
      jest.spyOn(userRepository, 'save').mockRejectedValueOnce(new Error('Database error'));

      await expect(service.createUser(createUserDto)).rejects.toThrow(
        new InternalServerErrorException("Une erreur est survenue lors de la création de l'utilisateur"),
      );
    });
  });
});