import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseInterceptors,
  UploadedFiles,
  Patch,
  UploadedFile,
} from "@nestjs/common";
import { FilesInterceptor, FileInterceptor } from "@nestjs/platform-express";
import { ProductService } from "./product.service";
import { CreateProductDto } from "./dto/create-product.dto";
import { ParseFilePipe } from "../upload/pipes/parse-file.pipe";

@Controller("products")
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  async create(@Body() createProductDto: CreateProductDto) {
    const product = await this.productService.create(createProductDto);
    return {
      message: "Product created successfully",
      product,
    };
  }

  @Get()
  async findAll() {
    const products = await this.productService.findAll();
    return {
      count: products.length,
      products,
    };
  }

  @Get("search")
  async search(@Query("q") searchTerm: string) {
    const products = await this.productService.search(searchTerm);
    return {
      count: products.length,
      searchTerm,
      products,
    };
  }

  @Get("category/:categoryId")
  async findByCategory(@Param("categoryId") categoryId: string) {
    const products = await this.productService.findByCategory(categoryId);
    return {
      count: products.length,
      categoryId,
      products,
    };
  }

  @Get("brand/:brandId")
  async findByBrand(@Param("brandId") brandId: string) {
    const products = await this.productService.findByBrand(brandId);
    return {
      count: products.length,
      brandId,
      products,
    };
  }

  @Get(":id")
  async findOne(@Param("id") id: string) {
    const product = await this.productService.findOne(id);
    return {
      product,
    };
  }

  @Put(":id")
  async update(
    @Param("id") id: string,
    @Body() updateData: Partial<CreateProductDto>
  ) {
    const product = await this.productService.update(id, updateData);
    return {
      message: "Product updated successfully",
      product,
    };
  }

  @Patch(":id/images")
  @UseInterceptors(FilesInterceptor("images", 10))
  async uploadImages(
    @Param("id") id: string,
    @UploadedFiles(
      new ParseFilePipe({
        maxSize: 5 * 1024 * 1024,
        allowedMimeTypes: ["image/jpeg", "image/png", "image/jpg"],
      })
    )
    files: Express.Multer.File[]
  ) {
    const product = await this.productService.uploadProductImages(id, files);
    return {
      message: "Product images uploaded successfully",
      product,
    };
  }

  @Patch(":id/thumbnail")
  @UseInterceptors(FileInterceptor("thumbnail"))
  async updateThumbnail(
    @Param("id") id: string,
    @UploadedFile(
      new ParseFilePipe({
        maxSize: 2 * 1024 * 1024,
        allowedMimeTypes: ["image/jpeg", "image/png", "image/jpg"],
        required: true,
      })
    )
    file: Express.Multer.File
  ) {
    const product = await this.productService.updateThumbnail(id, file);
    return {
      message: "Product thumbnail updated successfully",
      product,
    };
  }

  @Delete(":id")
  async remove(@Param("id") id: string) {
    await this.productService.remove(id);
    return {
      message: "Product deleted successfully",
    };
  }
}
