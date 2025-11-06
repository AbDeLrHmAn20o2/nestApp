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
} from "typeorm";
import { Category } from "../../category/entities/category.entity";

@Entity("brands")
export class Brand {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  image: string;

  @Column({ nullable: true })
  logo: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isFrozen: boolean;

  @ManyToMany(() => Category, (category) => category.brands)
  categories: Category[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @Column({ type: "jsonb", nullable: true })
  metadata: Record<string, any>;

  private previousState: Partial<Brand>;

  @BeforeUpdate()
  storePreviousState() {
    this.previousState = {
      name: this.name,
      description: this.description,
      image: this.image,
      logo: this.logo,
      isActive: this.isActive,
      isFrozen: this.isFrozen,
    };
  }

  @AfterUpdate()
  logUpdate() {
    console.log("Brand updated:", {
      id: this.id,
      previous: this.previousState,
      current: {
        name: this.name,
        description: this.description,
        image: this.image,
        logo: this.logo,
        isActive: this.isActive,
        isFrozen: this.isFrozen,
      },
      updatedAt: this.updatedAt,
    });
  }
}
