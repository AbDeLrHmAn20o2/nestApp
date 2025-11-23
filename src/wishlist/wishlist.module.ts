import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { WishlistController } from "./wishlist.controller";
import { WishlistService } from "./wishlist.service";
import { WishlistItem } from "./entities/wishlist-item.entity";
import { WishlistRepository } from "./repositories/wishlist.repository";
import { ProductModule } from "../product/product.module";

@Module({
  imports: [TypeOrmModule.forFeature([WishlistItem]), ProductModule],
  controllers: [WishlistController],
  providers: [WishlistService, WishlistRepository],
  exports: [WishlistService],
})
export class WishlistModule {}
