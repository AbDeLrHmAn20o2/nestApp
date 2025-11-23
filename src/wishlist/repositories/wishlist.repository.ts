import { Injectable } from "@nestjs/common";
import { DataSource, Repository } from "typeorm";
import { WishlistItem } from "../entities/wishlist-item.entity";

@Injectable()
export class WishlistRepository extends Repository<WishlistItem> {
  constructor(private dataSource: DataSource) {
    super(WishlistItem, dataSource.createEntityManager());
  }

  async findWishlistByUserId(userId: string): Promise<WishlistItem[]> {
    return await this.find({
      where: { userId },
      relations: ["product", "product.category", "product.brand"],
      order: { createdAt: "DESC" },
    });
  }

  async findWishlistItem(
    userId: string,
    productId: string
  ): Promise<WishlistItem> {
    return await this.findOne({
      where: { userId, productId },
    });
  }

  async addToWishlist(userId: string, productId: string): Promise<WishlistItem> {
    const item = this.create({ userId, productId });
    return await this.save(item);
  }

  async removeFromWishlist(id: string): Promise<void> {
    await this.delete(id);
  }

  async clearWishlist(userId: string): Promise<void> {
    await this.delete({ userId });
  }
}
