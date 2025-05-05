import { Module } from '@nestjs/common';
import { MatchingService } from './matching.service';
import { MatchingController } from './matching.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Offre } from 'src/clients/entities/offre.entity';
import { Engineer } from '../engineer/entities/engineer.entity';
import { Skills } from 'src/skills/entities/skill.entity';
import { User } from 'src/users/entities/user.entity';
import { MatchingResult } from './entities/matching-result.entity';
@Module({
  imports: [TypeOrmModule.forFeature([Offre, Engineer, Skills, User,MatchingResult])],
  controllers: [MatchingController],
  providers: [MatchingService],
})
export class MatchingModule {}