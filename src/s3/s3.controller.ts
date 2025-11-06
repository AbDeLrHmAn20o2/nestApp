import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  Delete,
  Param,
  Get,
} from "@nestjs/common";
import { FileInterceptor, FilesInterceptor } from "@nestjs/platform-express";
import { S3Service } from "./s3.service";
import { ParseFilePipe } from "../upload/pipes/parse-file.pipe";

@Controller("s3")
export class S3Controller {
  constructor(private s3Service: S3Service) {}

  @Post("upload")
  @UseInterceptors(FileInterceptor("file"))
  async uploadToS3(
    @UploadedFile(
      new ParseFilePipe({
        maxSize: 10 * 1024 * 1024,
        required: true,
      })
    )
    file: Express.Multer.File
  ) {
    const key = await this.s3Service.uploadFile(file, "uploads");
    const url = await this.s3Service.getFileUrl(key);

    return {
      message: "File uploaded to S3 successfully",
      key,
      url,
    };
  }

  @Post("upload-multiple")
  @UseInterceptors(FilesInterceptor("files", 10))
  async uploadMultipleToS3(
    @UploadedFiles(
      new ParseFilePipe({
        maxSize: 10 * 1024 * 1024,
      })
    )
    files: Express.Multer.File[]
  ) {
    const keys = await this.s3Service.uploadMultipleFiles(files, "uploads");
    const urls = await Promise.all(
      keys.map((key) => this.s3Service.getFileUrl(key))
    );

    return {
      message: "Files uploaded to S3 successfully",
      count: files.length,
      files: keys.map((key, index) => ({
        key,
        url: urls[index],
      })),
    };
  }

  @Delete("delete/:key")
  async deleteFromS3(@Param("key") key: string) {
    await this.s3Service.deleteFile(key);

    return {
      message: "File deleted from S3 successfully",
      key,
    };
  }

  @Get("url/:key")
  async getFileUrl(@Param("key") key: string) {
    const url = await this.s3Service.getFileUrl(key);

    return {
      key,
      url,
    };
  }

  @Get("signed-url/:key")
  async getSignedUrl(@Param("key") key: string) {
    const signedUrl = await this.s3Service.getSignedUrl(key, 3600);

    return {
      key,
      signedUrl,
      expiresIn: 3600,
    };
  }

  @Get("exists/:key")
  async checkFileExists(@Param("key") key: string) {
    const exists = await this.s3Service.fileExists(key);

    return {
      key,
      exists,
    };
  }
}
