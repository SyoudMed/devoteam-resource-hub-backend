import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { AuthModule } from '../auth/auth.module';
import { EngineerModule } from 'src/engineer/engineer.module';
import { Engineer } from 'src/engineer/entities/engineer.entity';


@Module({
  imports: [
    TypeOrmModule.forFeature([User,Engineer]),
    forwardRef(() => AuthModule),
    EngineerModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
