import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { UserRole } from 'src/common/enum/UserRole.enum';

export class CreateUserDto {


  @IsOptional()
  @IsNotEmpty()
  firstName: string;



  @IsOptional()
  @IsNotEmpty()
  lastName: string;



  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsEnum(UserRole)
  role: UserRole;

  

  @IsOptional()
  @IsString()
  telephone: string;

}
