import { Injectable } from "@nestjs/common";
import { DataSource, Repository } from "typeorm";
import { Product } from "../entities/product.entity";

@Injectable()
export class ProductRepository extends Repository<Product> {
  constructor(private dataSource: DataSource) {
    super(Product, dataSource.createEntityManager());
  }

  async createProduct(data: Partial<Product>): Promise<Product> {
    const product = this.create(data);
    return await this.save(product);
  }

  async findById(id: string): Promise<Product | null> {
    return await this.findOne({
      where: { id },
      relations: ["category", "brand"],
    });
  }

  async getAllProducts(): Promise<Product[]> {
    return await this.find({
      relations: ["category", "brand"],
    });
  }

  async findByCategory(categoryId: string): Promise<Product[]> {
    return await this.find({
      where: { categoryId },
      relations: ["category", "brand"],
    });
  }

  async findByBrand(brandId: string): Promise<Product[]> {
    return await this.find({
      where: { brandId },
      relations: ["category", "brand"],
    });
  }

  async updateProduct(id: string, data: Partial<Product>): Promise<Product> {
    await this.update(id, data);
    return await this.findById(id);
  }

  async searchProducts(searchTerm: string): Promise<Product[]> {
    return await this.createQueryBuilder("product")
      .leftJoinAndSelect("product.category", "category")
      .leftJoinAndSelect("product.brand", "brand")
      .where("product.name ILIKE :search", { search: `%${searchTerm}%` })
      .orWhere("product.description ILIKE :search", {
        search: `%${searchTerm}%`,
      })
      .getMany();
  }
}
