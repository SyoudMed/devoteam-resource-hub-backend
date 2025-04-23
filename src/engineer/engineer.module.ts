import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Engineer } from './entities/engineer.entity';
import { EngineerService } from './engineer.service';
import { EngineerController } from './engineer.controller';
import { User } from 'src/users/entities/user.entity';
import { AuthModule } from 'src/auth/auth.module';

import { Experience } from '../experiences/entities/experience.entity';

import { MailService } from 'src/mail/mail.service';
import { ExperienceService } from 'src/experiences/experience.service';
import { Skills } from 'src/skills/entities/skill.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Engineer,User,Experience,Skills]),
    forwardRef(() => AuthModule),
],
    providers: [EngineerService,MailService,ExperienceService],
    controllers: [EngineerController],
    exports: [EngineerService],
})
export class EngineerModule {}