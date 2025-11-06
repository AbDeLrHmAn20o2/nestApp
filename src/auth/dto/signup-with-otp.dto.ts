import { IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator";

export class SignupWithOtpDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsString()
  firstName?: string;

  @IsString()
  lastName?: string;
}
