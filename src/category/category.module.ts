import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Category } from "./entities/category.entity";
import { CategoryRepository } from "./repositories/category.repository";
import { CategoryService } from "./category.service";
import { CategoryController } from "./category.controller";
import { BrandModule } from "../brand/brand.module";

@Module({
  imports: [TypeOrmModule.forFeature([Category]), BrandModule],
  controllers: [CategoryController],
  providers: [CategoryRepository, CategoryService],
  exports: [CategoryService, CategoryRepository],
})
export class CategoryModule {}
