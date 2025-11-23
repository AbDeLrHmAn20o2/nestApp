import {
  Injectable,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { WishlistRepository } from "./repositories/wishlist.repository";
import { ProductService } from "../product/product.service";
import { WishlistItem } from "./entities/wishlist-item.entity";
import { AddToWishlistDto } from "./dto/add-to-wishlist.dto";

@Injectable()
export class WishlistService {
  constructor(
    private wishlistRepository: WishlistRepository,
    private productService: ProductService
  ) {}

  async getWishlist(userId: string): Promise<WishlistItem[]> {
    return await this.wishlistRepository.findWishlistByUserId(userId);
  }

  async addToWishlist(
    userId: string,
    addToWishlistDto: AddToWishlistDto
  ): Promise<WishlistItem> {
    await this.productService.findOne(addToWishlistDto.productId);

    const existingItem = await this.wishlistRepository.findWishlistItem(
      userId,
      addToWishlistDto.productId
    );

    if (existingItem) {
      throw new ConflictException("Product already in wishlist");
    }

    return await this.wishlistRepository.addToWishlist(
      userId,
      addToWishlistDto.productId
    );
  }

  async removeFromWishlist(userId: string, wishlistItemId: string): Promise<void> {
    const item = await this.wishlistRepository.findOne({
      where: { id: wishlistItemId, userId },
    });

    if (!item) {
      throw new NotFoundException("Wishlist item not found");
    }

    await this.wishlistRepository.removeFromWishlist(wishlistItemId);
  }

  async clearWishlist(userId: string): Promise<void> {
    await this.wishlistRepository.clearWishlist(userId);
  }

  async checkInWishlist(userId: string, productId: string): Promise<boolean> {
    const item = await this.wishlistRepository.findWishlistItem(userId, productId);
    return !!item;
  }
}
