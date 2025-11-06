import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import * as crypto from "crypto";
import { TokenRepository } from "./repositories/token.repository";
import { Token, TokenType } from "./entities/token.entity";
import { User } from "../users/entities/user.entity";

@Injectable()
export class TokenService {
  constructor(
    private tokenRepository: TokenRepository,
    private jwtService: JwtService,
    private configService: ConfigService
  ) {}

  async generateAccessToken(
    user: User,
    ipAddress?: string,
    userAgent?: string
  ): Promise<string> {
    const payload = { sub: user.id, email: user.email, type: TokenType.ACCESS };
    const token = this.jwtService.sign(payload);

    const expiresIn = this.configService.get("JWT_EXPIRATION") || "1h";
    const expiresAt = this.calculateExpiration(expiresIn);

    await this.tokenRepository.createToken({
      token,
      type: TokenType.ACCESS,
      userId: user.id,
      expiresAt,
      ipAddress,
      userAgent,
    });

    return token;
  }

  async generateRefreshToken(
    user: User,
    ipAddress?: string,
    userAgent?: string
  ): Promise<string> {
    const payload = {
      sub: user.id,
      email: user.email,
      type: TokenType.REFRESH,
    };
    const secret =
      this.configService.get("JWT_REFRESH_SECRET") ||
      this.configService.get("JWT_SECRET");
    const token = this.jwtService.sign(payload, {
      secret,
      expiresIn: "7d",
    });

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.tokenRepository.createToken({
      token,
      type: TokenType.REFRESH,
      userId: user.id,
      expiresAt,
      ipAddress,
      userAgent,
    });

    return token;
  }

  async generateTokenPair(
    user: User,
    ipAddress?: string,
    userAgent?: string
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const [accessToken, refreshToken] = await Promise.all([
      this.generateAccessToken(user, ipAddress, userAgent),
      this.generateRefreshToken(user, ipAddress, userAgent),
    ]);

    return { accessToken, refreshToken };
  }

  async generateEmailConfirmationToken(userId: string): Promise<string> {
    const token = crypto.randomBytes(32).toString("hex");

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    await this.tokenRepository.createToken({
      token,
      type: TokenType.EMAIL_CONFIRMATION,
      userId,
      expiresAt,
    });

    return token;
  }

  async generatePasswordResetToken(userId: string): Promise<string> {
    const token = crypto.randomBytes(32).toString("hex");

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    await this.tokenRepository.createToken({
      token,
      type: TokenType.PASSWORD_RESET,
      userId,
      expiresAt,
    });

    return token;
  }

  async verifyToken(token: string): Promise<Token> {
    const tokenEntity = await this.tokenRepository.findByToken(token);

    if (!tokenEntity) {
      throw new UnauthorizedException("Invalid token");
    }

    if (tokenEntity.expiresAt < new Date()) {
      throw new UnauthorizedException("Token expired");
    }

    return tokenEntity;
  }

  async verifyRefreshToken(token: string): Promise<Token> {
    const tokenEntity = await this.tokenRepository.findByToken(token);

    if (!tokenEntity || tokenEntity.type !== TokenType.REFRESH) {
      throw new UnauthorizedException("Invalid refresh token");
    }

    if (tokenEntity.expiresAt < new Date()) {
      throw new UnauthorizedException("Refresh token expired");
    }

    return tokenEntity;
  }

  async refreshAccessToken(
    refreshToken: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<{ accessToken: string }> {
    const tokenEntity = await this.verifyRefreshToken(refreshToken);

    await this.tokenRepository.revokeAllUserTokens(
      tokenEntity.userId,
      TokenType.ACCESS
    );

    const accessToken = await this.generateAccessToken(
      tokenEntity.user,
      ipAddress,
      userAgent
    );

    return { accessToken };
  }

  async revokeToken(token: string): Promise<void> {
    const tokenEntity = await this.tokenRepository.findByToken(token);
    if (tokenEntity) {
      await this.tokenRepository.revokeToken(tokenEntity.id);
    }
  }

  async revokeAllUserTokens(userId: string, type?: TokenType): Promise<void> {
    await this.tokenRepository.revokeAllUserTokens(userId, type);
  }

  async logout(userId: string): Promise<void> {
    await this.tokenRepository.revokeAllUserTokens(userId);
  }

  async isTokenValid(token: string): Promise<boolean> {
    return await this.tokenRepository.isTokenValid(token);
  }

  private calculateExpiration(expiresIn: string): Date {
    const expiresAt = new Date();
    const match = expiresIn.match(/^(\d+)([smhd])$/);

    if (!match) {
      expiresAt.setHours(expiresAt.getHours() + 1);
      return expiresAt;
    }

    const value = parseInt(match[1]);
    const unit = match[2];

    switch (unit) {
      case "s":
        expiresAt.setSeconds(expiresAt.getSeconds() + value);
        break;
      case "m":
        expiresAt.setMinutes(expiresAt.getMinutes() + value);
        break;
      case "h":
        expiresAt.setHours(expiresAt.getHours() + value);
        break;
      case "d":
        expiresAt.setDate(expiresAt.getDate() + value);
        break;
    }

    return expiresAt;
  }
}
