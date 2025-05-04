import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Offre } from 'src/clients/entities/offre.entity';
import { Engineer } from 'src/engineer/entities/engineer.entity';
import { MatchingResult } from './entities/matching-result.entity';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class MatchingService {
  constructor(
    @InjectRepository(Offre)
    private offreRepo: Repository<Offre>,

    @InjectRepository(Engineer)
    private engineerRepo: Repository<Engineer>,

    @InjectRepository(MatchingResult)
    private matchResultRepo: Repository<MatchingResult>, // 👈 injection du repo
  ) {}

  async match(offreId: number) {
    const offre = await this.offreRepo.findOne({
      where: { id: offreId },
      relations: ['requiredSkills'],
    });

    if (!offre) {
      throw new NotFoundException(`Offre avec l'ID ${offreId} non trouvée`);
    }

    const engineers = await this.engineerRepo.find({
      relations: ['skills', 'user'],
    });

    // Supprime les anciens résultats
    await this.matchResultRepo.delete({ offre });

    const results = engineers.map((engineer) => {
      const score = this.computeScore(offre, engineer);
    
      const offreSkillNames = offre.requiredSkills.map((s) => s.skill_name.toLowerCase());
      const engineerSkillNames = engineer.skills.map((s) => s.skill_name.toLowerCase());
    
      const missingSkills = offreSkillNames.filter(skill => !engineerSkillNames.includes(skill));
    
      return {
        engineerId: engineer.id,
        matchScore: score,
        firstName: engineer.user?.firstName,
        lastName: engineer.user?.lastName,
        poste: engineer.poste,
        skills: engineer.skills,
        profilePhotoUrl: engineer.user?.profilePhotoUrl,
        total_experience_year: engineer.totalExperienceYear,
        missingSkills, 
      };
    });
    

    const sortedResults = results.sort((a, b) => b.matchScore - a.matchScore);

    // Sauvegarde les nouveaux résultats
    await Promise.all(
      sortedResults.map((r) =>
        this.matchResultRepo.save(
          this.matchResultRepo.create({
            engineer: { id: r.engineerId },
            offre,
            score: r.matchScore,
          }),
        ),
      ),
    );

    console.log('🟢 Matched engineers with details:', sortedResults);
    return sortedResults;
  }

  computeScore(offre: Offre, engineer: Engineer): number {
    const offreSkillNames = offre.requiredSkills.map((s) => s.skill_name.toLowerCase());
    const engineerSkillNames = engineer.skills.map((s) => s.skill_name.toLowerCase());

    const matchedSkills = engineerSkillNames.filter((skill) =>
      offreSkillNames.includes(skill),
    );

    const skillScore = (matchedSkills.length / offreSkillNames.length) * 60;
    const specialityScore = engineer.speciality === offre.requiredSpeciality ? 20 : 0;
    const experienceScore = engineer.totalExperienceYear >= offre.experience ? 10  : 0;

    const languageScore = 10; // à améliorer avec parsing JSON

    return skillScore + specialityScore + experienceScore + languageScore;
  }
}
