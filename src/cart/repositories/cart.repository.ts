import { Injectable } from "@nestjs/common";
import { DataSource, Repository } from "typeorm";
import { CartItem } from "../entities/cart-item.entity";

@Injectable()
export class CartRepository extends Repository<CartItem> {
  constructor(private dataSource: DataSource) {
    super(CartItem, dataSource.createEntityManager());
  }

  async findCartByUserId(userId: string): Promise<CartItem[]> {
    return await this.find({
      where: { userId },
      relations: ["product", "product.category", "product.brand"],
      order: { createdAt: "DESC" },
    });
  }

  async findCartItem(userId: string, productId: string): Promise<CartItem> {
    return await this.findOne({
      where: { userId, productId },
      relations: ["product"],
    });
  }

  async addToCart(
    userId: string,
    productId: string,
    quantity: number,
    price: number
  ): Promise<CartItem> {
    const cartItem = this.create({
      userId,
      productId,
      quantity,
      price,
    });
    return await this.save(cartItem);
  }

  async updateQuantity(id: string, quantity: number): Promise<CartItem> {
    await this.update(id, { quantity });
    return await this.findOne({
      where: { id },
      relations: ["product"],
    });
  }

  async removeFromCart(id: string): Promise<void> {
    await this.delete(id);
  }

  async clearCart(userId: string): Promise<void> {
    await this.delete({ userId });
  }

  async getCartTotal(userId: string): Promise<number> {
    const items = await this.findCartByUserId(userId);
    return items.reduce((total, item) => total + item.price * item.quantity, 0);
  }
}
