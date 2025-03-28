import { IsEmail, IsString, MinLength } from "class-validator";

export class ValidateAccountDto{
    @IsEmail()
    email: string;

    @IsString()
    verificationCode: string;
}
