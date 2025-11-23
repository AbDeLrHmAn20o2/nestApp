import { Module, MiddlewareConsumer, NestModule } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { MailModule } from "./mail/mail.module";
import { OtpModule } from "./otp/otp.module";
import { DemoModule } from "./demo/demo.module";
import { TokenModule } from "./token/token.module";
import { MiddlewareExampleModule } from "./middleware-example/middleware-example.module";
import { AuthorizationExampleModule } from "./authorization-example/authorization-example.module";
import { LoggingMiddleware } from "./common/middleware/logging.middleware";
import { loggerMiddleware } from "./common/middleware/functional/logger.middleware";
import { UploadModule } from "./upload/upload.module";
import { S3Module } from "./s3/s3.module";
import { BrandModule } from "./brand/brand.module";
import { CategoryModule } from "./category/category.module";
import { ProductModule } from "./product/product.module";
import { CartModule } from "./cart/cart.module";
import { WishlistModule } from "./wishlist/wishlist.module";
import { CouponModule } from "./coupon/coupon.module";
import { OrderModule } from "./order/order.module";
import { PaymentModule } from "./payment/payment.module";
import { SocketModule } from "./socket/socket.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: "postgres",
        host: configService.get("DATABASE_HOST"),
        port: configService.get("DATABASE_PORT"),
        username: configService.get("DATABASE_USERNAME"),
        password: configService.get("DATABASE_PASSWORD"),
        database: configService.get("DATABASE_NAME"),
        entities: [__dirname + "/**/*.entity{.ts,.js}"],
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    MailModule,
    OtpModule,
    DemoModule,
    TokenModule,
    MiddlewareExampleModule,
    AuthorizationExampleModule,
    UploadModule,
    S3Module,
    BrandModule,
    CategoryModule,
    ProductModule,
    CartModule,
    WishlistModule,
    CouponModule,
    OrderModule,
    PaymentModule,
    SocketModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggingMiddleware).forRoutes("*");
    consumer.apply(loggerMiddleware).forRoutes("*");
  }
}
