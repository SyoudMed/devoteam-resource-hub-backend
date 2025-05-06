import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Offre } from 'src/clients/entities/offre.entity';
import { Engineer } from 'src/engineer/entities/engineer.entity';
import { MatchingResult } from './entities/matching-result.entity';
import { Speciality } from 'src/common/enum/Speciality.enum';

@Injectable()
export class MatchingService {
  constructor(
    @InjectRepository(Offre)
    private offreRepo: Repository<Offre>,

    @InjectRepository(Engineer)
    private engineerRepo: Repository<Engineer>,

    @InjectRepository(MatchingResult)
    private matchResultRepo: Repository<MatchingResult>,
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

    await this.matchResultRepo.delete({ offre });

    const results = engineers.map((engineer) => {
      const score = this.computeScore(offre, engineer);
      const missingSkills = this.calculateMissingSkills(offre, engineer);

      return {
        engineerId: engineer.id,
        matchScore: score,
        firstName: engineer.user?.firstName,
        lastName: engineer.user?.lastName,
        poste: engineer.poste,
        speciality: engineer.speciality,
        availabilityStatus: engineer.disponibiliteStatus,
        skills: engineer.skills,
        profilePhotoUrl: engineer.user?.profilePhotoUrl,
        total_experience_year: engineer.totalExperienceYear,
        missingSkills,
      };
    });

    const sortedResults = results.sort((a, b) => b.matchScore - a.matchScore);
    const top6Results = sortedResults.slice(0, 6);

    if (top6Results.length > 0) {
      await Promise.all(
        top6Results.map((r) =>
          this.matchResultRepo.save(
            this.matchResultRepo.create({
              engineer: { id: r.engineerId },
              offre,
              score: r.matchScore,
            }),
          ),
        ),
      );
    }

    return sortedResults;
  }

  async getMatchesByOffreId(offreId: number) {
    const offre = await this.offreRepo.findOne({
      where: { id: offreId },
      relations: ['requiredSkills'],
    });

    if (!offre) {
      throw new NotFoundException(`Offre avec l'ID ${offreId} non trouvée`);
    }

    try {
      const matchingResults = await this.matchResultRepo.find({
        where: { offre: { id: offreId } },
        relations: ['engineer', 'engineer.user', 'engineer.skills'],
        order: { score: 'DESC' },
      });

      return matchingResults.map((result) => {
        const missingSkills = this.calculateMissingSkills(offre, result.engineer);

        return {
          engineerId: result.engineer.id,
          matchScore: result.score,
          firstName: result.engineer.user?.firstName,
          lastName: result.engineer.user?.lastName,
          email: result.engineer.user?.email,
          tel: result.engineer.user?.telephone,
          poste: result.engineer.poste,
          speciality: result.engineer.speciality,
          availabilityStatus: result.engineer.disponibiliteStatus,
          skills: result.engineer.skills,
          profilePhotoUrl: result.engineer.user?.profilePhotoUrl,
          total_experience_year: result.engineer.totalExperienceYear,
          missingSkills,
        };
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des résultats :', error);
      throw new InternalServerErrorException('Erreur serveur lors de la récupération des correspondances');
    }
  }

  private calculateMissingSkills(offre: Offre, engineer: Engineer) {
    const offreSkillNames = (offre.requiredSkills || []).map((s) =>
      s.skill_name?.toLowerCase(),
    );
    const engineerSkillNames = (engineer.skills || []).map((s) =>
      s.skill_name?.toLowerCase(),
    );

    return offreSkillNames
      .filter((skill) => skill && !engineerSkillNames.includes(skill))
      .map((skill) => ({ skill_name: skill }));
  }

  private computeScore(offre: Offre, engineer: Engineer): number {
    const offreSkillNames = (offre.requiredSkills || []).map((s) => s.skill_name?.toLowerCase());
    const engineerSkillNames = (engineer.skills || []).map((s) => s.skill_name?.toLowerCase());

    const matchedSkills = engineerSkillNames.filter((skill) =>
      offreSkillNames.includes(skill),
    );

    const skillScore = (matchedSkills.length / (offreSkillNames.length || 1)) * 60;
    const specialityScore = engineer.speciality === offre.requiredSpeciality ? 20 : 0;
    const experienceScore = engineer.totalExperienceYear >= offre.experience ? 10 : 0;
    const languageScore = 10; 

    return skillScore + specialityScore + experienceScore + languageScore;
  }
}
