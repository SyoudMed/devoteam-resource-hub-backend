import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommercialController } from './commercial.controller';
import { CommercialService } from './commercial.service';
import { User } from 'src/users/entities/user.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]),
forwardRef(() => AuthModule),],
  controllers: [CommercialController],
  providers: [CommercialService],
})
export class CommercialModule {}
