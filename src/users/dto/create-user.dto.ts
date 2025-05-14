import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { AvailabilityStatus } from 'src/common/enum/AvailabilityStatus.enum';
import { Speciality } from 'src/common/enum/Speciality.enum';
import { UserRole } from 'src/common/enum/UserRole.enum';

export class CreateUserDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsString()
  telephone: string;

  @IsEmail()
  email: string;



  @IsEnum(UserRole)
  role: UserRole;

  @IsEnum(AvailabilityStatus)
  @IsOptional()
  disponibiliteStatus?: AvailabilityStatus;

  @IsEnum(Speciality)
  @IsOptional() 
  speciality?: Speciality;
}
