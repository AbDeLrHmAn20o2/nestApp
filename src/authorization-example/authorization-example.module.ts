import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TokenModule } from "../token/token.module";
import { AuthorizationExampleController } from "./authorization-example.controller";

@Module({
  imports: [
    TokenModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get("JWT_SECRET"),
        signOptions: { expiresIn: configService.get("JWT_EXPIRATION") },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthorizationExampleController],
})
export class AuthorizationExampleModule {}
