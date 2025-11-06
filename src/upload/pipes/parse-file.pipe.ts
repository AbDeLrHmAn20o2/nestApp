import { PipeTransform, Injectable, BadRequestException } from "@nestjs/common";

@Injectable()
export class ParseFilePipe implements PipeTransform {
  constructor(
    private readonly options?: {
      maxSize?: number;
      allowedMimeTypes?: string[];
      required?: boolean;
    }
  ) {}

  transform(
    file: Express.Multer.File | Express.Multer.File[]
  ): Express.Multer.File | Express.Multer.File[] {
    if (!file) {
      if (this.options?.required) {
        throw new BadRequestException("File is required");
      }
      return file;
    }

    if (Array.isArray(file)) {
      file.forEach((f) => this.validateFile(f));
    } else {
      this.validateFile(file);
    }

    return file;
  }

  private validateFile(file: Express.Multer.File): void {
    if (this.options?.maxSize && file.size > this.options.maxSize) {
      throw new BadRequestException(
        `File size exceeds maximum allowed size of ${this.options.maxSize} bytes`
      );
    }

    if (
      this.options?.allowedMimeTypes &&
      !this.options.allowedMimeTypes.includes(file.mimetype)
    ) {
      throw new BadRequestException(
        `File type ${
          file.mimetype
        } is not allowed. Allowed types: ${this.options.allowedMimeTypes.join(
          ", "
        )}`
      );
    }
  }
}
