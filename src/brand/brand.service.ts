import {
  Injectable,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { BrandRepository } from "./repositories/brand.repository";
import { S3Service } from "../s3/s3.service";
import { CreateBrandDto } from "./dto/create-brand.dto";
import { UpdateBrandDto } from "./dto/update-brand.dto";
import { Brand } from "./entities/brand.entity";

@Injectable()
export class BrandService {
  constructor(
    private brandRepository: BrandRepository,
    private s3Service: S3Service
  ) {}

  async create(createBrandDto: CreateBrandDto): Promise<Brand> {
    const existingBrand = await this.brandRepository.findByName(
      createBrandDto.name
    );

    if (existingBrand) {
      throw new ConflictException("Brand with this name already exists");
    }

    return await this.brandRepository.createBrand(createBrandDto);
  }

  async findAll(search?: string): Promise<Brand[]> {
    return await this.brandRepository.getAllBrands(search);
  }

  async findOne(id: string): Promise<Brand> {
    const brand = await this.brandRepository.findById(id);

    if (!brand) {
      throw new NotFoundException("Brand not found");
    }

    return brand;
  }

  async update(id: string, updateBrandDto: UpdateBrandDto): Promise<Brand> {
    const brand = await this.findOne(id);

    if (updateBrandDto.name && updateBrandDto.name !== brand.name) {
      const existingBrand = await this.brandRepository.findByName(
        updateBrandDto.name
      );
      if (existingBrand) {
        throw new ConflictException("Brand with this name already exists");
      }
    }

    return await this.brandRepository.updateBrand(id, updateBrandDto);
  }

  async updateImage(id: string, file: Express.Multer.File): Promise<Brand> {
    const brand = await this.findOne(id);

    if (brand.image) {
      await this.s3Service.deleteFile(brand.image);
    }

    const imageKey = await this.s3Service.uploadFile(file, "brands");
    const imageUrl = await this.s3Service.getFileUrl(imageKey);

    return await this.brandRepository.updateBrand(id, { image: imageUrl });
  }

  async updateLogo(id: string, file: Express.Multer.File): Promise<Brand> {
    const brand = await this.findOne(id);

    if (brand.logo) {
      await this.s3Service.deleteFile(brand.logo);
    }

    const logoKey = await this.s3Service.uploadFile(file, "brands/logos");
    const logoUrl = await this.s3Service.getFileUrl(logoKey);

    return await this.brandRepository.updateBrand(id, { logo: logoUrl });
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.brandRepository.softDeleteBrand(id);
  }

  async hardDelete(id: string): Promise<void> {
    await this.findOne(id);
    await this.brandRepository.hardDelete(id);
  }

  async freeze(id: string): Promise<Brand> {
    await this.findOne(id);
    return await this.brandRepository.freeze(id);
  }

  async restore(id: string): Promise<Brand> {
    const brand = await this.brandRepository.findWithDeleted(id);

    if (!brand) {
      throw new NotFoundException("Brand not found");
    }

    if (!brand.deletedAt) {
      throw new ConflictException("Brand is not deleted");
    }

    return await this.brandRepository.restoreBrand(id);
  }

  async unfreeze(id: string): Promise<Brand> {
    await this.findOne(id);
    return await this.brandRepository.unfreeze(id);
  }

  async search(
    searchTerm: string,
    includeInactive: boolean = false
  ): Promise<Brand[]> {
    return await this.brandRepository.searchBrands(searchTerm, {
      includeInactive,
    });
  }
}
