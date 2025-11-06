import { Module } from "@nestjs/common";
import { MulterModule } from "@nestjs/platform-express";
import { UploadController } from "./upload.controller";
import { multerConfig } from "./config/multer.config";

@Module({
  imports: [MulterModule.register(multerConfig)],
  controllers: [UploadController],
})
export class UploadModule {}
