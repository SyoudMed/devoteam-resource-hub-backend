import { UserRole } from "src/common/enum/UserRole.enum";
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
    @IsOptional()
    @IsEnum(UserRole)
    role?: UserRole;


    
        
  }