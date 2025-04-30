import { IsInt, IsString, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class SkillDto {
  @IsString()
  category: string;

  @IsArray()
  @IsString({ each: true })
  skills: string[];
}

class ExperienceDto {
  @IsString()
  entreprise: string;

  @IsString()
  poste: string;


  @IsOptional()
  @IsString()
  periode: string;

  @IsArray()
  @IsString({ each: true })
  responsabilities: string[];
}

export class UpdateEngineerProfileDto {
  @IsOptional()
  @IsString()
  poste?: string;

  @IsOptional()
  @IsInt()
  totalExperienceYear?: number;

  @IsOptional()
  @IsString()
  languages?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SkillDto)
  skills?: SkillDto[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  formations?: string[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExperienceDto)
  experience?: ExperienceDto[];

  @IsOptional()
  cv?: Express.Multer.File;
}
