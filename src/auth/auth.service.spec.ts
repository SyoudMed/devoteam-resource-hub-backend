import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { MailService } from '../mail/mail.service';
import { User } from '../users/entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { UnauthorizedException } from '@nestjs/common';
import { UserRole } from 'src/common/enum/UserRole.enum';

describe('AuthService Integration', () => {
  let authService: AuthService;
  let userRepository: Repository<User>;
  let module: TestingModule;

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('mockedJwtToken'),
  };

  const mockMailService = {
    sendResetPasswordEmail: jest.fn(),
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
          database: 'test_devoteam_resources_hub',
          entities: [User],
          synchronize: true,
        }),
        TypeOrmModule.forFeature([User]),
      ],
      providers: [
        AuthService,
        UsersService,
        { provide: JwtService, useValue: mockJwtService },
        { provide: MailService, useValue: mockMailService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  }, 10000); 

  beforeEach(async () => {
    
    await userRepository.query('DELETE FROM user');

    
    try {
      const hashedPassword = await bcrypt.hash('password123', 10);
      const user = userRepository.create({
        firstName: 'John',
        lastName: 'Doe',
        telephone: '1234567890',
        email: 'test@example.com',
        password: hashedPassword,
        role: UserRole.INGENIEUR,
        isVerified: true,
        isFirstLogin: false,
      });
      await userRepository.save(user);
    } catch (error) {
      console.error('Erreur lors de la création de l\'utilisateur:', error);
      throw error;
    }
  });

  afterAll(async () => {
    await module.close();
  });

  describe('authenticate', () => {
    it('should return AuthResult with access token for valid credentials', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const result = await authService.authenticate(loginDto);

      expect(result).toEqual({
        accessToken: 'mockedJwtToken',
        id: expect.any(Number),
        email: 'test@example.com',
        role: UserRole.INGENIEUR,
        firstLogin: false,
      });
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: expect.any(Number),
        email: 'test@example.com',
        role: UserRole.INGENIEUR,
      });
    });

    it('should return AuthResult with firstLogin true for first login', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      const user = userRepository.create({
        firstName: 'Jane',
        lastName: 'Doe',
        telephone: '0987654321',
        email: 'jane@example.com',
        password: hashedPassword,
        role: UserRole.INGENIEUR,
        isVerified: true,
        isFirstLogin: true,
      });
      await userRepository.save(user);

      const loginDto = {
        email: 'jane@example.com',
        password: 'password123',
      };

      const result = await authService.authenticate(loginDto);

      expect(result).toEqual({
        accessToken: 'mockedJwtToken',
        id: expect.any(Number),
        email: 'jane@example.com',
        role: UserRole.INGENIEUR,
        firstLogin: true,
      });
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: expect.any(Number),
        email: 'jane@example.com',
        role: UserRole.INGENIEUR,
      });
    });

    it('should throw UnauthorizedException for invalid password', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      await expect(authService.authenticate(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException for non-existent user', async () => {
      const loginDto = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };

      await expect(authService.authenticate(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException for unverified user', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      const user = userRepository.create({
        firstName: 'Unverified',
        lastName: 'User',
        telephone: '1112223333',
        email: 'unverified@example.com',
        password: hashedPassword,
        role: UserRole.INGENIEUR,
        isVerified: false,
        isFirstLogin: false,
      });
      await userRepository.save(user);

      const loginDto = {
        email: 'unverified@example.com',
        password: 'password123',
      };

      await expect(authService.authenticate(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(authService.authenticate(loginDto)).rejects.toThrow(
        'Compte non activé. Veuillez valider votre email.',
      );
    });
  });
});