import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CartController } from "./cart.controller";
import { CartService } from "./cart.service";
import { CartItem } from "./entities/cart-item.entity";
import { CartRepository } from "./repositories/cart.repository";
import { ProductModule } from "../product/product.module";

@Module({
  imports: [TypeOrmModule.forFeature([CartItem]), ProductModule],
  controllers: [CartController],
  providers: [CartService, CartRepository],
  exports: [CartService],
})
export class CartModule {}
