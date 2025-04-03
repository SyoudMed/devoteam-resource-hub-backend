import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Engineer } from './entities/engineer.entity';
import { EngineerService } from './engineer.service';
import { EngineerController } from './engineer.controller';
import { User } from 'src/users/entities/user.entity';
import { AuthModule } from 'src/auth/auth.module';
import { MailService } from 'src/auth/mail.service';

@Module({
    imports: [TypeOrmModule.forFeature([Engineer,User]),
    forwardRef(() => AuthModule),
],
    providers: [EngineerService,MailService],
    controllers: [EngineerController],
    exports: [EngineerService],
})
export class EngineerModule {}
