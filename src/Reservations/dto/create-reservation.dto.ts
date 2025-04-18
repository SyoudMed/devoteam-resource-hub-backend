import { IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateReservationDto {
  @IsDateString()
  @IsNotEmpty()
  startTime: Date;

  @IsDateString()
  @IsNotEmpty()
  endTime: Date;

  @IsNumber()
  @IsNotEmpty()
  duration: number;

  @IsString()
  @IsNotEmpty()
  clientName: string;

  @IsString()
  @IsNotEmpty()
  meetingPurpose: string;

  @IsNumber()
  @IsNotEmpty()
  engineerId: number;

  @IsNumber()
  @IsNotEmpty()
  commercialId: number;

  @IsNumber()
  @IsNotEmpty()
  offreId: number;
}