import { IsString, IsInt, IsArray, ValidateNested, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

class ExperienceDto {
  @IsString()
  company: string;

  @IsString()
  job_title: string;

  @IsString()
  period: string;

  @IsArray()
  responsibilities: string[];
}

class SkillDto {
  @IsString()
  original: string;

  @IsString()
  normalized: string;

  @IsString()
  category: string;
}

export enum Speciality {
  DEVELOPER = 'Developer',
  DEVOPS = 'DevOps',
  CYBER_SECURITY = 'Cyber Security',
  DATA = 'Data',
}

export class CreateEngineerDto {
  @IsString()
  position: string;

  @IsInt()
  total_experience_years: number;

  @IsEnum(Speciality)
  speciality: Speciality;

  @IsArray()
  languages: string[];

  @IsArray()
  trainings: string[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExperienceDto)
  experiences: ExperienceDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SkillDto)
  skills: SkillDto[];
}
