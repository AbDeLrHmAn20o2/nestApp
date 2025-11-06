import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  BeforeUpdate,
  AfterUpdate,
  ManyToMany,
  JoinTable,
  OneToMany,
} from "typeorm";
import { Brand } from "../../brand/entities/brand.entity";
import { Product } from "../../product/entities/product.entity";

@Entity("categories")
export class Category {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  image: string;

  @Column({ nullable: true })
  slug: string;

  @Column({ default: true })
  isActive: boolean;

  @ManyToMany(() => Brand, (brand) => brand.categories)
  @JoinTable({
    name: "category_brands",
    joinColumn: { name: "categoryId", referencedColumnName: "id" },
    inverseJoinColumn: { name: "brandId", referencedColumnName: "id" },
  })
  brands: Brand[];

  @OneToMany(() => Product, (product) => product.category)
  products: Product[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @Column({ type: "jsonb", nullable: true })
  metadata: Record<string, any>;

  private previousState: Partial<Category>;

  @BeforeUpdate()
  storePreviousState() {
    this.previousState = {
      name: this.name,
      description: this.description,
      image: this.image,
      slug: this.slug,
      isActive: this.isActive,
    };
  }

  @AfterUpdate()
  logUpdate() {
    console.log("Category updated:", {
      id: this.id,
      previous: this.previousState,
      current: {
        name: this.name,
        description: this.description,
        image: this.image,
        slug: this.slug,
        isActive: this.isActive,
      },
      updatedAt: this.updatedAt,
    });
  }
}
