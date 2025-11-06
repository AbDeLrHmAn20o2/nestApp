import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { Token } from "./entities/token.entity";
import { TokenRepository } from "./repositories/token.repository";
import { TokenService } from "./token.service";
import { TokenCleanupService } from "./token-cleanup.service";
import { TokenController } from "./token.controller";

@Module({
  imports: [
    TypeOrmModule.forFeature([Token]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get("JWT_SECRET"),
        signOptions: { expiresIn: configService.get("JWT_EXPIRATION") },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [TokenController],
  providers: [TokenRepository, TokenService, TokenCleanupService],
  exports: [TokenService, TokenRepository],
})
export class TokenModule {}
