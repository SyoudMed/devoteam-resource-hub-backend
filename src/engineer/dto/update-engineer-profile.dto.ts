import { IsInt, IsString, IsOptional, IsArray, IsEnum } from 'class-validator';
import { AvailabilityStatus } from 'src/common/enum/AvailabilityStatus.enum';
import { Speciality } from '../entities/engineer.entity';

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
  skills?: { name: string; category: string }[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  formations?: string[];

  @IsOptional()
  @IsArray()
  experience?: {
    entreprise: string;
    poste: string;
    periode: string;
    responsabilities: string[];
  }[];

  @IsOptional()
  cv?: Express.Multer.File;

  
}