import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional, ValidateIf } from 'class-validator';

export class UpdateUserDto {
  @IsEmail()
  @ValidateIf((o) => o.email !== undefined)
  @IsOptional()
  email?: string;

  @IsString()
  @MinLength(6)
  @ValidateIf((o) => o.password !== undefined)
  @IsOptional()
  password?: string;

  @IsString()
  @ValidateIf((o) => o.firstName !== undefined)
  @IsOptional()
  firstName?: string;

  @IsString()
  @ValidateIf((o) => o.lastName !== undefined)
  @IsOptional()
  lastName?: string;
}
