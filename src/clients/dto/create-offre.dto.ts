import { IsString, IsInt, IsDateString, IsEnum, IsArray, IsOptional } from 'class-validator';
import { Speciality, OffreStatus } from '../entities/offre.entity';

export class CreateOffreDto {
  @IsString()
  clientName: string;

  @IsInt()
  experience: number;

  @IsString()
  jobTitle: string;

  @IsDateString()
  startDate: Date;

  @IsDateString()
  endDate: Date;

  @IsEnum(OffreStatus)
  @IsOptional() 
  status?: OffreStatus;

  @IsEnum(Speciality)
  requiredSpeciality: Speciality;

  @IsArray()
  @IsString({ each: true }) 
  requiredSkills?: string[];


  @IsInt()
  createdById?: number;
}