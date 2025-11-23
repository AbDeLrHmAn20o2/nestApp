import { Injectable } from "@nestjs/common";
import { DataSource, Repository } from "typeorm";
import { Order, OrderStatus, PaymentStatus } from "../entities/order.entity";

@Injectable()
export class OrderRepository extends Repository<Order> {
  constructor(private dataSource: DataSource) {
    super(Order, dataSource.createEntityManager());
  }

  async createOrder(data: Partial<Order>): Promise<Order> {
    const order = this.create(data);
    return await this.save(order);
  }

  async findOrderById(id: string): Promise<Order> {
    return await this.findOne({
      where: { id },
      relations: ["items", "items.product", "user", "coupon"],
    });
  }

  async findOrdersByUserId(userId: string): Promise<Order[]> {
    return await this.find({
      where: { userId },
      relations: ["items", "items.product", "coupon"],
      order: { createdAt: "DESC" },
    });
  }

  async getAllOrders(): Promise<Order[]> {
    return await this.find({
      relations: ["items", "items.product", "user", "coupon"],
      order: { createdAt: "DESC" },
    });
  }

  async updateOrderStatus(id: string, status: OrderStatus): Promise<Order> {
    await this.update(id, { status });
    return await this.findOrderById(id);
  }

  async updatePaymentStatus(
    id: string,
    paymentStatus: PaymentStatus
  ): Promise<Order> {
    await this.update(id, { paymentStatus });
    return await this.findOrderById(id);
  }

  async findByStripePaymentIntentId(
    stripePaymentIntentId: string
  ): Promise<Order> {
    return await this.findOne({
      where: { stripePaymentIntentId },
      relations: ["items", "items.product", "user"],
    });
  }
}
