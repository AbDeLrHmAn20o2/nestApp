import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  BeforeUpdate,
  AfterUpdate,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Brand } from "../../brand/entities/brand.entity";
import { Category } from "../../category/entities/category.entity";

@Entity("products")
export class Product {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  price: number;

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
  comparePrice: number;

  @Column({ default: 0 })
  stock: number;

  @Column({ nullable: true })
  sku: string;

  @Column("simple-array", { nullable: true })
  images: string[];

  @Column({ nullable: true })
  thumbnail: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isFeatured: boolean;

  @Column()
  categoryId: string;

  @ManyToOne(() => Category, (category) => category.products)
  @JoinColumn({ name: "categoryId" })
  category: Category;

  @Column({ nullable: true })
  brandId: string;

  @ManyToOne(() => Brand)
  @JoinColumn({ name: "brandId" })
  brand: Brand;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @Column({ type: "jsonb", nullable: true })
  specifications: Record<string, any>;

  @Column({ type: "jsonb", nullable: true })
  metadata: Record<string, any>;

  private previousState: Partial<Product>;

  @BeforeUpdate()
  storePreviousState() {
    this.previousState = {
      name: this.name,
      description: this.description,
      price: this.price,
      comparePrice: this.comparePrice,
      stock: this.stock,
      images: this.images,
      thumbnail: this.thumbnail,
      isActive: this.isActive,
      isFeatured: this.isFeatured,
      categoryId: this.categoryId,
      brandId: this.brandId,
    };
  }

  @AfterUpdate()
  logUpdate() {
    console.log("Product updated:", {
      id: this.id,
      previous: this.previousState,
      current: {
        name: this.name,
        description: this.description,
        price: this.price,
        comparePrice: this.comparePrice,
        stock: this.stock,
        images: this.images,
        thumbnail: this.thumbnail,
        isActive: this.isActive,
        isFeatured: this.isFeatured,
        categoryId: this.categoryId,
        brandId: this.brandId,
      },
      updatedAt: this.updatedAt,
    });
  }
}
