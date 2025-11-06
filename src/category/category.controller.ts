import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Patch,
} from "@nestjs/common";
import { CategoryService } from "./category.service";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { AddBrandsToCategoryDto } from "./dto/add-brands.dto";

@Controller("categories")
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  async create(@Body() createCategoryDto: CreateCategoryDto) {
    const category = await this.categoryService.create(createCategoryDto);
    return {
      message: "Category created successfully",
      category,
    };
  }

  @Get()
  async findAll() {
    const categories = await this.categoryService.findAll();
    return {
      count: categories.length,
      categories,
    };
  }

  @Get("with-brands")
  async findCategoriesWithBrands() {
    const categories = await this.categoryService.findCategoriesWithBrands();
    return {
      count: categories.length,
      categories,
    };
  }

  @Get(":id")
  async findOne(@Param("id") id: string) {
    const category = await this.categoryService.findOne(id);
    return {
      category,
    };
  }

  @Put(":id")
  async update(
    @Param("id") id: string,
    @Body() updateData: Partial<CreateCategoryDto>
  ) {
    const category = await this.categoryService.update(id, updateData);
    return {
      message: "Category updated successfully",
      category,
    };
  }

  @Patch(":id/brands")
  async addBrandsToCategory(
    @Param("id") id: string,
    @Body() addBrandsToCategoryDto: AddBrandsToCategoryDto
  ) {
    const category = await this.categoryService.addBrandsToCategory(
      id,
      addBrandsToCategoryDto.brandIds
    );
    return {
      message: "Brands added to category successfully",
      category,
    };
  }

  @Delete(":id/brands")
  async removeBrandsFromCategory(
    @Param("id") id: string,
    @Body() removeBrandsDto: AddBrandsToCategoryDto
  ) {
    const category = await this.categoryService.removeBrandsFromCategory(
      id,
      removeBrandsDto.brandIds
    );
    return {
      message: "Brands removed from category successfully",
      category,
    };
  }

  @Delete(":id")
  async remove(@Param("id") id: string) {
    await this.categoryService.remove(id);
    return {
      message: "Category deleted successfully",
    };
  }
}
