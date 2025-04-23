import { IsString, IsInt, IsArray, ValidateNested } from 'class-validator';
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
  

export class CreateEngineerDto {
  @IsString()
  position: string;

  @IsInt()
  total_experience_years: number;

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
