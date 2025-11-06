import { Injectable, NotFoundException } from "@nestjs/common";
import { ProductRepository } from "./repositories/product.repository";
import { CategoryService } from "../category/category.service";
import { BrandService } from "../brand/brand.service";
import { S3Service } from "../s3/s3.service";
import { CreateProductDto } from "./dto/create-product.dto";
import { Product } from "./entities/product.entity";

@Injectable()
export class ProductService {
  constructor(
    private productRepository: ProductRepository,
    private categoryService: CategoryService,
    private brandService: BrandService,
    private s3Service: S3Service
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    await this.categoryService.findOne(createProductDto.categoryId);

    if (createProductDto.brandId) {
      await this.brandService.findOne(createProductDto.brandId);
    }

    return await this.productRepository.createProduct(createProductDto);
  }

  async findAll(): Promise<Product[]> {
    return await this.productRepository.getAllProducts();
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productRepository.findById(id);

    if (!product) {
      throw new NotFoundException("Product not found");
    }

    return product;
  }

  async findByCategory(categoryId: string): Promise<Product[]> {
    await this.categoryService.findOne(categoryId);
    return await this.productRepository.findByCategory(categoryId);
  }

  async findByBrand(brandId: string): Promise<Product[]> {
    await this.brandService.findOne(brandId);
    return await this.productRepository.findByBrand(brandId);
  }

  async update(
    id: string,
    updateData: Partial<CreateProductDto>
  ): Promise<Product> {
    await this.findOne(id);

    if (updateData.categoryId) {
      await this.categoryService.findOne(updateData.categoryId);
    }

    if (updateData.brandId) {
      await this.brandService.findOne(updateData.brandId);
    }

    return await this.productRepository.updateProduct(id, updateData);
  }

  async uploadProductImages(
    id: string,
    files: Express.Multer.File[]
  ): Promise<Product> {
    const product = await this.findOne(id);

    const imageKeys = await this.s3Service.uploadMultipleFiles(
      files,
      "products"
    );
    const imageUrls = await Promise.all(
      imageKeys.map((key) => this.s3Service.getFileUrl(key))
    );

    const updatedImages = [...(product.images || []), ...imageUrls];

    return await this.productRepository.updateProduct(id, {
      images: updatedImages,
    });
  }

  async updateThumbnail(
    id: string,
    file: Express.Multer.File
  ): Promise<Product> {
    const product = await this.findOne(id);

    if (product.thumbnail) {
      await this.s3Service.deleteFile(product.thumbnail);
    }

    const thumbnailKey = await this.s3Service.uploadFile(
      file,
      "products/thumbnails"
    );
    const thumbnailUrl = await this.s3Service.getFileUrl(thumbnailKey);

    return await this.productRepository.updateProduct(id, {
      thumbnail: thumbnailUrl,
    });
  }

  async search(searchTerm: string): Promise<Product[]> {
    return await this.productRepository.searchProducts(searchTerm);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.productRepository.softDelete(id);
  }
}
