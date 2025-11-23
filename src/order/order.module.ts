import { Module, forwardRef } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { OrderController } from "./order.controller";
import { OrderService } from "./order.service";
import { Order } from "./entities/order.entity";
import { OrderItem } from "./entities/order-item.entity";
import { OrderRepository } from "./repositories/order.repository";
import { CartModule } from "../cart/cart.module";
import { CouponModule } from "../coupon/coupon.module";
import { ProductModule } from "../product/product.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem]),
    CartModule,
    CouponModule,
    ProductModule,
  ],
  controllers: [OrderController],
  providers: [OrderService, OrderRepository],
  exports: [OrderService],
})
export class OrderModule {}
