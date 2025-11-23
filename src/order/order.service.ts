import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { OrderRepository } from "./repositories/order.repository";
import { CartService } from "../cart/cart.service";
import { CouponService } from "../coupon/coupon.service";
import { ProductService } from "../product/product.service";
import { Order, OrderStatus, PaymentMethod, PaymentStatus } from "./entities/order.entity";
import { CreateOrderDto } from "./dto/create-order.dto";
import { DataSource } from "typeorm";

@Injectable()
export class OrderService {
  constructor(
    private orderRepository: OrderRepository,
    private cartService: CartService,
    private couponService: CouponService,
    private productService: ProductService,
    private dataSource: DataSource
  ) {}

  async create(userId: string, createOrderDto: CreateOrderDto): Promise<Order> {
    const cartItems = await this.cartService.getCart(userId);

    if (cartItems.length === 0) {
      throw new BadRequestException("Cart is empty");
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let subtotal = 0;
      const orderItems = [];

      for (const item of cartItems) {
        const product = await this.productService.findOne(item.productId);

        if (product.stock < item.quantity) {
          throw new BadRequestException(
            `Insufficient stock for product: ${product.name}`
          );
        }

        const itemSubtotal = product.price * item.quantity;
        subtotal += itemSubtotal;

        orderItems.push({
          productId: item.productId,
          productName: product.name,
          price: product.price,
          quantity: item.quantity,
          subtotal: itemSubtotal,
        });

        await queryRunner.manager.update(
          "products",
          { id: product.id },
          { stock: product.stock - item.quantity }
        );
      }

      let discount = 0;
      let couponId = null;

      if (createOrderDto.couponCode) {
        const coupon = await this.couponService.validateCoupon(
          createOrderDto.couponCode,
          subtotal
        );
        discount = this.couponService.calculateDiscount(coupon, subtotal);
        couponId = coupon.id;

        await this.couponService.incrementUsage(coupon.id);
      }

      const shippingCost = createOrderDto.shippingCost || 0;
      const tax = 0;
      const total = subtotal - discount + tax + shippingCost;

      const savedOrder = await queryRunner.manager.save("orders", {
        userId,
        subtotal,
        discount,
        tax,
        shippingCost,
        total,
        couponId,
        paymentMethod: createOrderDto.paymentMethod,
        paymentStatus:
          createOrderDto.paymentMethod === PaymentMethod.CASH
            ? PaymentStatus.PENDING
            : PaymentStatus.PENDING,
        status: OrderStatus.PENDING,
        shippingAddress: createOrderDto.shippingAddress,
        notes: createOrderDto.notes,
      });

      const orderId = (savedOrder as any).id;

      for (const item of orderItems) {
        await queryRunner.manager.save("order_items", {
          ...item,
          orderId,
        });
      }

      await this.cartService.clearCart(userId);

      await queryRunner.commitTransaction();

      return await this.orderRepository.findOrderById(orderId);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(): Promise<Order[]> {
    return await this.orderRepository.getAllOrders();
  }

  async findOne(id: string): Promise<Order> {
    const order = await this.orderRepository.findOrderById(id);

    if (!order) {
      throw new NotFoundException("Order not found");
    }

    return order;
  }

  async findUserOrders(userId: string): Promise<Order[]> {
    return await this.orderRepository.findOrdersByUserId(userId);
  }

  async updateStatus(id: string, status: OrderStatus): Promise<Order> {
    await this.findOne(id);
    return await this.orderRepository.updateOrderStatus(id, status);
  }

  async updatePaymentStatus(
    id: string,
    paymentStatus: PaymentStatus
  ): Promise<Order> {
    return await this.orderRepository.updatePaymentStatus(id, paymentStatus);
  }

  async refundOrder(orderId: string): Promise<Order> {
    const order = await this.findOne(orderId);

    if (order.paymentStatus !== PaymentStatus.PAID) {
      throw new BadRequestException("Order is not paid");
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      for (const item of order.items) {
        const product = await this.productService.findOne(item.productId);
        await queryRunner.manager.update(
          "products",
          { id: product.id },
          { stock: product.stock + item.quantity }
        );
      }

      await queryRunner.manager.update("orders", order.id, {
        status: OrderStatus.REFUNDED,
        paymentStatus: PaymentStatus.REFUNDED,
      });

      await queryRunner.commitTransaction();

      return await this.orderRepository.findOrderById(orderId);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
