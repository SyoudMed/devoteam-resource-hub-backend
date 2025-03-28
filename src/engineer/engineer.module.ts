import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Engineer } from './entities/engineer.entity';
import { EngineerService } from './engineer.service';
import { EngineerController } from './engineer.controller';
import { User } from 'src/users/entities/user.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
    imports: [TypeOrmModule.forFeature([Engineer,User]),
    forwardRef(() => AuthModule),
],
    providers: [EngineerService],
    controllers: [EngineerController],
    exports: [EngineerService],
})
export class EngineerModule {}
