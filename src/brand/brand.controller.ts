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
  UploadedFile,
  Patch,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { BrandService } from "./brand.service";
import { CreateBrandDto } from "./dto/create-brand.dto";
import { UpdateBrandDto } from "./dto/update-brand.dto";
import { ParseFilePipe } from "../upload/pipes/parse-file.pipe";

@Controller("brands")
export class BrandController {
  constructor(private readonly brandService: BrandService) {}

  @Post()
  async create(@Body() createBrandDto: CreateBrandDto) {
    const brand = await this.brandService.create(createBrandDto);
    return {
      message: "Brand created successfully",
      brand,
    };
  }

  @Get()
  async findAll(@Query("search") search?: string) {
    const brands = await this.brandService.findAll(search);
    return {
      count: brands.length,
      brands,
    };
  }

  @Get("search")
  async search(
    @Query("q") searchTerm: string,
    @Query("includeInactive") includeInactive?: boolean
  ) {
    const brands = await this.brandService.search(searchTerm, includeInactive);
    return {
      count: brands.length,
      searchTerm,
      brands,
    };
  }

  @Get(":id")
  async findOne(@Param("id") id: string) {
    const brand = await this.brandService.findOne(id);
    return {
      brand,
    };
  }

  @Put(":id")
  async update(
    @Param("id") id: string,
    @Body() updateBrandDto: UpdateBrandDto
  ) {
    const brand = await this.brandService.update(id, updateBrandDto);
    return {
      message: "Brand updated successfully",
      brand,
    };
  }

  @Patch(":id/image")
  @UseInterceptors(FileInterceptor("image"))
  async updateImage(
    @Param("id") id: string,
    @UploadedFile(
      new ParseFilePipe({
        maxSize: 5 * 1024 * 1024,
        allowedMimeTypes: ["image/jpeg", "image/png", "image/jpg"],
        required: true,
      })
    )
    file: Express.Multer.File
  ) {
    const brand = await this.brandService.updateImage(id, file);
    return {
      message: "Brand image updated successfully",
      brand,
    };
  }

  @Patch(":id/logo")
  @UseInterceptors(FileInterceptor("logo"))
  async updateLogo(
    @Param("id") id: string,
    @UploadedFile(
      new ParseFilePipe({
        maxSize: 2 * 1024 * 1024,
        allowedMimeTypes: ["image/png", "image/svg+xml"],
        required: true,
      })
    )
    file: Express.Multer.File
  ) {
    const brand = await this.brandService.updateLogo(id, file);
    return {
      message: "Brand logo updated successfully",
      brand,
    };
  }

  @Delete(":id")
  async remove(@Param("id") id: string) {
    await this.brandService.remove(id);
    return {
      message: "Brand deleted successfully (soft delete)",
    };
  }

  @Delete(":id/hard")
  async hardDelete(@Param("id") id: string) {
    await this.brandService.hardDelete(id);
    return {
      message: "Brand permanently deleted",
    };
  }

  @Patch(":id/freeze")
  async freeze(@Param("id") id: string) {
    const brand = await this.brandService.freeze(id);
    return {
      message: "Brand frozen successfully",
      brand,
    };
  }

  @Patch(":id/unfreeze")
  async unfreeze(@Param("id") id: string) {
    const brand = await this.brandService.unfreeze(id);
    return {
      message: "Brand unfrozen successfully",
      brand,
    };
  }

  @Patch(":id/restore")
  async restore(@Param("id") id: string) {
    const brand = await this.brandService.restore(id);
    return {
      message: "Brand restored successfully",
      brand,
    };
  }
}
