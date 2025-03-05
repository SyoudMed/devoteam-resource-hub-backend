import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { User } from './users/entities/user.entity';
import { UsersModule } from './users/users.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import jwtConfig from './auth/config/jwt.config';
import { EngineerModule } from './engineer/engineer.module';
import { Engineer } from './engineer/entities/engineer.entity';


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
        entities: [User,Engineer], 
        synchronize: true,
      }),
      inject: [ConfigService], 
    }),

    AuthModule,
    UsersModule,
    EngineerModule,
  ],
})
export class AppModule {}



