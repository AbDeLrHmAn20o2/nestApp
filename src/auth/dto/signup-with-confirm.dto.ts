import { IsEmail, IsNotEmpty, IsString, MinLength, ValidateIf, IsOptional } from 'class-validator';
import { Match } from '../../common/decorators/match.decorator';

export class SignupWithConfirmPasswordDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsString()
  @IsNotEmpty()
  @Match('password', { message: 'Passwords do not match' })
  confirmPassword: string;

  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;
}
