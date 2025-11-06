import {
  Module,
  MiddlewareConsumer,
  NestModule,
  RequestMethod,
} from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TokenModule } from "../token/token.module";
import { AuthMiddleware } from "../common/middleware/auth.middleware";
import { TokenValidationMiddleware } from "../common/middleware/token-validation.middleware";
import { MiddlewareExampleController } from "./middleware-example.controller";

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
  controllers: [MiddlewareExampleController],
})
export class MiddlewareExampleModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes(
        { path: "middleware-example/protected", method: RequestMethod.GET },
        { path: "middleware-example/admin", method: RequestMethod.GET }
      );

    consumer
      .apply(TokenValidationMiddleware)
      .forRoutes({
        path: "middleware-example/validated",
        method: RequestMethod.GET,
      });
  }
}
