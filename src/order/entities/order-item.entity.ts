import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Order } from "./order.entity";
import { Product } from "../../product/entities/product.entity";

@Entity("order_items")
export class OrderItem {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  orderId: string;

  @ManyToOne(() => Order, (order) => order.items)
  @JoinColumn({ name: "orderId" })
  order: Order;

  @Column()
  productId: string;

  @ManyToOne(() => Product)
  @JoinColumn({ name: "productId" })
  product: Product;

  @Column()
  productName: string;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  price: number;

  @Column()
  quantity: number;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  subtotal: number;
}
