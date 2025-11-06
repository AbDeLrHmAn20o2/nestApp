import { Injectable } from "@nestjs/common";
import { DataSource, Repository, ILike } from "typeorm";
import { Brand } from "../entities/brand.entity";

@Injectable()
export class BrandRepository extends Repository<Brand> {
  constructor(private dataSource: DataSource) {
    super(Brand, dataSource.createEntityManager());
  }

  async createBrand(data: Partial<Brand>): Promise<Brand> {
    const brand = this.create(data);
    return await this.save(brand);
  }

  async findById(id: string): Promise<Brand | null> {
    return await this.findOne({
      where: { id },
      relations: ["categories"],
    });
  }

  async findByName(name: string): Promise<Brand | null> {
    return await this.findOne({
      where: { name },
    });
  }

  async getAllBrands(search?: string): Promise<Brand[]> {
    const queryBuilder = this.createQueryBuilder("brand")
      .leftJoinAndSelect("brand.categories", "categories")
      .where("brand.deletedAt IS NULL");

    if (search) {
      queryBuilder.andWhere(
        "(brand.name ILIKE :search OR brand.description ILIKE :search)",
        { search: `%${search}%` }
      );
    }

    return await queryBuilder.getMany();
  }

  async updateBrand(id: string, data: Partial<Brand>): Promise<Brand> {
    await this.update(id, data);
    return await this.findById(id);
  }

  async softDeleteBrand(id: string): Promise<void> {
    await this.softDelete(id);
  }

  async hardDelete(id: string): Promise<void> {
    await this.delete(id);
  }

  async freeze(id: string): Promise<Brand> {
    await this.update(id, { isFrozen: true, isActive: false });
    return await this.findById(id);
  }

  async restoreBrand(id: string): Promise<Brand> {
    await this.restore(id);
    await this.update(id, { isFrozen: false });
    return await this.findById(id);
  }

  async unfreeze(id: string): Promise<Brand> {
    await this.update(id, { isFrozen: false, isActive: true });
    return await this.findById(id);
  }

  async findWithDeleted(id: string): Promise<Brand | null> {
    return await this.findOne({
      where: { id },
      withDeleted: true,
      relations: ["categories"],
    });
  }

  async searchBrands(
    searchTerm: string,
    options?: { includeInactive?: boolean }
  ): Promise<Brand[]> {
    const queryBuilder = this.createQueryBuilder("brand")
      .leftJoinAndSelect("brand.categories", "categories")
      .where("brand.deletedAt IS NULL");

    if (searchTerm) {
      queryBuilder.andWhere(
        "(brand.name ILIKE :search OR brand.description ILIKE :search)",
        { search: `%${searchTerm}%` }
      );
    }

    if (!options?.includeInactive) {
      queryBuilder.andWhere("brand.isActive = :isActive", { isActive: true });
    }

    return await queryBuilder.getMany();
  }
}
