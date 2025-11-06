import {
  Injectable,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { CategoryRepository } from "./repositories/category.repository";
import { BrandRepository } from "../brand/repositories/brand.repository";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { Category } from "./entities/category.entity";

@Injectable()
export class CategoryService {
  constructor(
    private categoryRepository: CategoryRepository,
    private brandRepository: BrandRepository
  ) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    const existingCategory = await this.categoryRepository.findByName(
      createCategoryDto.name
    );

    if (existingCategory) {
      throw new ConflictException("Category with this name already exists");
    }

    if (!createCategoryDto.slug && createCategoryDto.name) {
      createCategoryDto.slug = createCategoryDto.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
    }

    return await this.categoryRepository.createCategory(createCategoryDto);
  }

  async findAll(): Promise<Category[]> {
    return await this.categoryRepository.getAllCategories();
  }

  async findOne(id: string): Promise<Category> {
    const category = await this.categoryRepository.findById(id);

    if (!category) {
      throw new NotFoundException("Category not found");
    }

    return category;
  }

  async update(id: string, updateData: Partial<Category>): Promise<Category> {
    await this.findOne(id);

    if (updateData.name) {
      const existingCategory = await this.categoryRepository.findByName(
        updateData.name
      );
      if (existingCategory && existingCategory.id !== id) {
        throw new ConflictException("Category with this name already exists");
      }
    }

    return await this.categoryRepository.updateCategory(id, updateData);
  }

  async addBrandsToCategory(
    categoryId: string,
    brandIds: string[]
  ): Promise<Category> {
    await this.findOne(categoryId);

    for (const brandId of brandIds) {
      const brand = await this.brandRepository.findById(brandId);
      if (!brand) {
        throw new NotFoundException(`Brand with id ${brandId} not found`);
      }
    }

    return await this.categoryRepository.addBrandsToCategory(
      categoryId,
      brandIds
    );
  }

  async removeBrandsFromCategory(
    categoryId: string,
    brandIds: string[]
  ): Promise<Category> {
    await this.findOne(categoryId);
    return await this.categoryRepository.removeBrandsFromCategory(
      categoryId,
      brandIds
    );
  }

  async findCategoriesWithBrands(): Promise<Category[]> {
    return await this.categoryRepository.findCategoriesWithBrands();
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.categoryRepository.softDelete(id);
  }
}
