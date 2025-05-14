import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Engineer } from '../engineer/entities/engineer.entity';
import { User } from '../users/entities/user.entity';
import { Suggestion } from './entities/Suggestion.entity';
import { SuggestionService } from './suggestion.service';
import { SuggestionController } from './suggestion.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Suggestion, Engineer, User])],
  providers: [SuggestionService], 
  controllers: [SuggestionController], 
})
export class SuggestionModule {}