import { Injectable, UnauthorizedException, BadRequestException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { UserRepository } from '../users/repositories/user.repository';
import { MailService } from '../mail/mail.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private userRepository: UserRepository,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  async signup(signupDto: SignupDto): Promise<{ message: string }> {
    const existingUser = await this.userRepository.findByEmail(signupDto.email);
    
    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(signupDto.password, 10);
    const emailConfirmationToken = crypto.randomBytes(32).toString('hex');

    await this.userRepository.create({
      email: signupDto.email,
      password: hashedPassword,
      firstName: signupDto.firstName,
      lastName: signupDto.lastName,
      emailConfirmationToken,
      provider: 'local',
    });

    await this.mailService.sendEmailConfirmation(signupDto.email, emailConfirmationToken);

    return { message: 'Registration successful. Please check your email to confirm.' };
  }

  async login(loginDto: LoginDto): Promise<{ accessToken: string; user: any }> {
    const user = await this.userRepository.findByEmail(loginDto.email);

    if (!user || user.provider !== 'local') {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isEmailConfirmed) {
      throw new UnauthorizedException('Please confirm your email before logging in');
    }

    const payload = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    };
  }

  async confirmEmail(token: string): Promise<{ message: string }> {
    const user = await this.userRepository.findByEmailConfirmationToken(token);

    if (!user) {
      throw new BadRequestException('Invalid confirmation token');
    }

    user.isEmailConfirmed = true;
    user.emailConfirmationToken = null;
    await this.userRepository.save(user);

    return { message: 'Email confirmed successfully' };
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    const user = await this.userRepository.findByEmail(email);

    if (!user || user.provider !== 'local') {
      return { message: 'If the email exists, a reset link will be sent' };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 3600000);

    user.passwordResetToken = resetToken;
    user.passwordResetExpires = resetExpires;
    await this.userRepository.save(user);

    await this.mailService.sendPasswordReset(email, resetToken);

    return { message: 'If the email exists, a reset link will be sent' };
  }

  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    const user = await this.userRepository.findByPasswordResetToken(token);

    if (!user || !user.passwordResetExpires || user.passwordResetExpires < new Date()) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    await this.userRepository.save(user);

    return { message: 'Password reset successfully' };
  }

  async googleLogin(googleUser: any): Promise<{ accessToken: string; user: any }> {
    let user = await this.userRepository.findByGoogleId(googleUser.googleId);

    if (!user) {
      user = await this.userRepository.findByEmail(googleUser.email);
      
      if (user) {
        user.googleId = googleUser.googleId;
        user.provider = 'google';
        await this.userRepository.save(user);
      } else {
        user = await this.userRepository.create({
          email: googleUser.email,
          googleId: googleUser.googleId,
          firstName: googleUser.firstName,
          lastName: googleUser.lastName,
          isEmailConfirmed: true,
          provider: 'google',
        });
      }
    }

    const payload = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    };
  }

  async validateUser(userId: string): Promise<User> {
    return await this.userRepository.findById(userId);
  }
}
