import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Column,
} from "typeorm";
import { User } from "../../users/entities/user.entity";
import { Product } from "../../product/entities/product.entity";

@Entity("wishlist_items")
export class WishlistItem {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: "userId" })
  user: User;

  @Column()
  productId: string;

  @ManyToOne(() => Product)
  @JoinColumn({ name: "productId" })
  product: Product;

  @CreateDateColumn()
  createdAt: Date;
}
