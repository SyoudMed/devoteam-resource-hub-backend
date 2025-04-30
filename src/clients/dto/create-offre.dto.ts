// src/offres/dto/create-offre.dto.ts

import { IsString, IsEnum, IsDateString, IsInt, Min, Max, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { Speciality } from '../entities/offre.entity';

class SkillDto {
  @IsString()
  skill_name: string;

  @IsString()
  category: string;
}

export class CreateOffreDto {
  @IsString()
  clientName: string;

  @IsString()
  jobTitle: string;

  @IsInt()
  @Min(1)
  @Max(50)
  experience: number;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsEnum(Speciality)
  requiredSpeciality: Speciality;

  @IsArray()
  languages: string[];

  @ValidateNested({ each: true })
  @Type(() => SkillDto)
  requiredSkills: SkillDto[];

  @IsInt()
  createdById: number;
}
