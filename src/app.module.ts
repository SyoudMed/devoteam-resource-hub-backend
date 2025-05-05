import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { User } from './users/entities/user.entity';
import { UsersModule } from './users/users.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import jwtConfig from './auth/config/jwt.config';
import { EngineerModule } from './engineer/engineer.module';
import { Engineer } from './engineer/entities/engineer.entity';
import { CommercialModule } from './commercial/commercial.module';
import { CommentModule } from './comments/comment.module';
import { Comment } from './comments/entities/comment.entity';
import { ReservationModule } from './Reservations/reservation.module';
import { OffreModule } from './clients/offre.module';

import { MailModule } from './mail/mail.module';
import { ProfileUpdateGateway } from './profile-update.gateway';
import { MatchingModule } from './matching/matching.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [jwtConfig],
      envFilePath: '.env',
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('DATABASE_HOST'),
        port: configService.get<number>('DATABASE_PORT'),
        username: configService.get<string>('DATABASE_USER'),
        password: configService.get<string>('DATABASE_PASSWORD'),
        database: configService.get<string>('DATABASE_NAME'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: false,
        migrations: [__dirname + '/migrations/*{.ts,.js}'],
        migrationsRun: true,
      }),
      inject: [ConfigService],
    }),

    AuthModule,
    UsersModule,
    MailModule,
    EngineerModule,
    CommercialModule,
    CommentModule,
    ReservationModule,
    OffreModule,
    MatchingModule,

  ],
  providers: [
    ProfileUpdateGateway, 
  ],

})
export class AppModule {}