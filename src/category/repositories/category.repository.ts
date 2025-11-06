import { Injectable } from "@nestjs/common";
import { DataSource, Repository, In } from "typeorm";
import { Category } from "../entities/category.entity";

@Injectable()
export class CategoryRepository extends Repository<Category> {
  constructor(private dataSource: DataSource) {
    super(Category, dataSource.createEntityManager());
  }

  async createCategory(data: Partial<Category>): Promise<Category> {
    const category = this.create(data);
    return await this.save(category);
  }

  async findById(id: string): Promise<Category | null> {
    return await this.findOne({
      where: { id },
      relations: ["brands", "products"],
    });
  }

  async findByName(name: string): Promise<Category | null> {
    return await this.findOne({
      where: { name },
    });
  }

  async getAllCategories(): Promise<Category[]> {
    return await this.find({
      relations: ["brands", "products"],
    });
  }

  async updateCategory(id: string, data: Partial<Category>): Promise<Category> {
    await this.update(id, data);
    return await this.findById(id);
  }

  async addBrandsToCategory(
    categoryId: string,
    brandIds: string[]
  ): Promise<Category> {
    const category = await this.findOne({
      where: { id: categoryId },
      relations: ["brands"],
    });

    const existingBrandIds = category.brands.map((brand) => brand.id);
    const newBrandIds = brandIds.filter((id) => !existingBrandIds.includes(id));

    if (newBrandIds.length > 0) {
      await this.createQueryBuilder()
        .relation(Category, "brands")
        .of(categoryId)
        .add(newBrandIds);
    }

    return await this.findById(categoryId);
  }

  async removeBrandsFromCategory(
    categoryId: string,
    brandIds: string[]
  ): Promise<Category> {
    await this.createQueryBuilder()
      .relation(Category, "brands")
      .of(categoryId)
      .remove(brandIds);

    return await this.findById(categoryId);
  }

  async findCategoriesWithBrands(): Promise<Category[]> {
    return await this.find({
      relations: ["brands"],
    });
  }
}
