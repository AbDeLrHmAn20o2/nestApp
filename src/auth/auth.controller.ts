import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  UseGuards,
  Req,
  UsePipes,
  Param,
  UseFilters,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { SignupWithConfirmPasswordDto } from './dto/signup-with-confirm.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserZodSchema, LoginZodSchema } from './dto/zod-schemas.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { TrimPipe } from '../common/pipes/trim.pipe';
import { ParseIntPipeCustom } from '../common/pipes/parse-int-custom.pipe';
import { HttpExceptionFilter } from '../common/filters/http-exception.filter';
import { BadRequestExceptionFilter } from '../common/filters/bad-request-exception.filter';

@Controller('auth')
@UseFilters(HttpExceptionFilter)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signup(@Body() signupDto: SignupDto) {
    return await this.authService.signup(signupDto);
  }

  @Post('signup-with-confirm')
  @UseFilters(BadRequestExceptionFilter)
  async signupWithConfirm(@Body() signupDto: SignupWithConfirmPasswordDto) {
    return await this.authService.signup(signupDto);
  }

  @Post('signup-zod')
  @UsePipes(new ZodValidationPipe(CreateUserZodSchema))
  async signupZod(@Body() signupDto: any) {
    return await this.authService.signup(signupDto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return await this.authService.login(loginDto);
  }

  @Post('login-zod')
  @UsePipes(new ZodValidationPipe(LoginZodSchema))
  async loginZod(@Body() loginDto: any) {
    return await this.authService.login(loginDto);
  }

  @Post('login-with-trim')
  async loginWithTrim(@Body(TrimPipe) loginDto: LoginDto) {
    return await this.authService.login(loginDto);
  }

  @Get('user/:id')
  @UseGuards(JwtAuthGuard)
  async getUserById(@Param('id', ParseIntPipeCustom) id: number) {
    return { userId: id, message: 'User retrieved with custom parse int pipe' };
  }

  @Get('confirm-email')
  async confirmEmail(@Query('token') token: string) {
    return await this.authService.confirmEmail(token);
  }

  @Post('forgot-password')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return await this.authService.forgotPassword(forgotPasswordDto.email);
  }

  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return await this.authService.resetPassword(
      resetPasswordDto.token,
      resetPasswordDto.newPassword,
    );
  }

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  async googleAuth() {}

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleAuthRedirect(@Req() req) {
    return await this.authService.googleLogin(req.user);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Req() req) {
    return req.user;
  }
}
