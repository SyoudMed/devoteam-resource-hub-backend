import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Experience } from './entities/experience.entity';
import { Engineer } from '../engineer/entities/engineer.entity';
import { ExperienceService } from './experience.service';
import { ExperienceController } from './experience.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Experience, Engineer]), // Déclare les entités pour TypeORM
  ],
  providers: [ExperienceService], // Fournit le service
  controllers: [ExperienceController], // Fournit le contrôleur
  exports: [ExperienceService], // Exporte le service pour une utilisation dans d'autres modules (optionnel)
})
export class ExperienceModule {}