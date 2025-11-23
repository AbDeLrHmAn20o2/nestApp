import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { PaymentController } from "./payment.controller";
import { PaymentService } from "./payment.service";
import { OrderModule } from "../order/order.module";

@Module({
  imports: [ConfigModule, OrderModule],
  controllers: [PaymentController],
  providers: [PaymentService],
  exports: [PaymentService],
})
export class PaymentModule {}
