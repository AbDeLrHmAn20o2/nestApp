import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  Body,
} from "@nestjs/common";
import {
  FileInterceptor,
  FilesInterceptor,
  FileFieldsInterceptor,
} from "@nestjs/platform-express";
import { multerConfig } from "./config/multer.config";
import { ParseFilePipe } from "./pipes/parse-file.pipe";
import { FileSizeValidationPipe } from "./pipes/file-size-validation.pipe";

@Controller("upload")
export class UploadController {
  @Post("single")
  @UseInterceptors(FileInterceptor("file", multerConfig))
  uploadSingle(
    @UploadedFile(
      new ParseFilePipe({
        maxSize: 5 * 1024 * 1024,
        allowedMimeTypes: ["image/jpeg", "image/png", "image/jpg"],
        required: true,
      })
    )
    file: Express.Multer.File
  ) {
    return {
      message: "File uploaded successfully",
      file: {
        filename: file.filename,
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        path: file.path,
      },
    };
  }

  @Post("multiple")
  @UseInterceptors(FilesInterceptor("files", 10, multerConfig))
  uploadMultiple(
    @UploadedFiles(
      new ParseFilePipe({
        maxSize: 5 * 1024 * 1024,
        allowedMimeTypes: ["image/jpeg", "image/png", "image/jpg", "image/gif"],
      })
    )
    files: Express.Multer.File[]
  ) {
    return {
      message: "Files uploaded successfully",
      count: files.length,
      files: files.map((file) => ({
        filename: file.filename,
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        path: file.path,
      })),
    };
  }

  @Post("array")
  @UseInterceptors(FilesInterceptor("images", 5, multerConfig))
  uploadArray(
    @UploadedFiles(new FileSizeValidationPipe(5 * 1024 * 1024))
    files: Express.Multer.File[]
  ) {
    return {
      message: "Array of files uploaded successfully",
      count: files.length,
      files: files.map((file) => ({
        filename: file.filename,
        originalname: file.originalname,
        size: file.size,
      })),
    };
  }

  @Post("fields")
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: "avatar", maxCount: 1 },
        { name: "gallery", maxCount: 5 },
      ],
      multerConfig
    )
  )
  uploadFields(
    @UploadedFiles()
    files: {
      avatar?: Express.Multer.File[];
      gallery?: Express.Multer.File[];
    }
  ) {
    return {
      message: "Multiple fields uploaded successfully",
      avatar: files.avatar?.[0]
        ? {
            filename: files.avatar[0].filename,
            originalname: files.avatar[0].originalname,
            size: files.avatar[0].size,
          }
        : null,
      gallery: files.gallery?.map((file) => ({
        filename: file.filename,
        originalname: file.originalname,
        size: file.size,
      })),
    };
  }
}
