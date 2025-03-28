
import { IsOptional, IsString, IsEnum } from 'class-validator';
export class UpdateUserDto {
  @IsOptional()
  @IsString()
    firstName?: string;
    @IsOptional()
    @IsString()
    lastName?: string;
    @IsOptional()
    @IsString()
    email?: string;
    @IsOptional()
    @IsString()
    password?: string;
    @IsString()
    @IsOptional()
    telephone?: string;
    @IsString()
    @IsOptional()
    profilePhotoUrl?: string 



    
        
  }