import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ProductController } from "./product.controller";
import { ProductService } from "./product.service";
import { Product } from "./entities/product.entity";
import { ProductRepository } from "./repositories/product.repository";
import { CategoryModule } from "../category/category.module";
import { BrandModule } from "../brand/brand.module";
import { S3Module } from "../s3/s3.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([Product]),
    CategoryModule,
    BrandModule,
    S3Module,
  ],
  controllers: [ProductController],
  providers: [ProductService, ProductRepository],
  exports: [ProductService],
})
export class ProductModule {}
