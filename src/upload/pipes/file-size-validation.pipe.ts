import { PipeTransform, Injectable, BadRequestException } from "@nestjs/common";

@Injectable()
export class FileSizeValidationPipe implements PipeTransform {
  constructor(private readonly maxSizeInBytes: number) {}

  transform(
    value: Express.Multer.File | Express.Multer.File[]
  ): Express.Multer.File | Express.Multer.File[] {
    if (!value) {
      return value;
    }

    if (Array.isArray(value)) {
      value.forEach((file) => {
        if (file.size > this.maxSizeInBytes) {
          throw new BadRequestException(
            `File ${file.originalname} exceeds maximum size of ${this.maxSizeInBytes} bytes`
          );
        }
      });
    } else {
      if (value.size > this.maxSizeInBytes) {
        throw new BadRequestException(
          `File exceeds maximum size of ${this.maxSizeInBytes} bytes`
        );
      }
    }

    return value;
  }
}
