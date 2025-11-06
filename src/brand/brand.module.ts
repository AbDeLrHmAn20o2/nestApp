import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Brand } from "./entities/brand.entity";
import { BrandRepository } from "./repositories/brand.repository";
import { BrandService } from "./brand.service";
import { BrandController } from "./brand.controller";
import { S3Module } from "../s3/s3.module";

@Module({
  imports: [TypeOrmModule.forFeature([Brand]), S3Module],
  controllers: [BrandController],
  providers: [BrandRepository, BrandService],
  exports: [BrandService, BrandRepository],
})
export class BrandModule {}
