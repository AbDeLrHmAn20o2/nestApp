import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Query,
} from "@nestjs/common";
import { WishlistService } from "./wishlist.service";
import { AddToWishlistDto } from "./dto/add-to-wishlist.dto";
import { AuthenticationGuard } from "../common/guards/authentication.guard";
import { CurrentUser } from "../common/decorators/current-user.decorator";

@Controller("wishlist")
@UseGuards(AuthenticationGuard)
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Get()
  async getWishlist(@CurrentUser("sub") userId: string) {
    const items = await this.wishlistService.getWishlist(userId);
    return {
      items,
      count: items.length,
    };
  }

  @Get("check/:productId")
  async checkInWishlist(
    @CurrentUser("sub") userId: string,
    @Param("productId") productId: string
  ) {
    const inWishlist = await this.wishlistService.checkInWishlist(
      userId,
      productId
    );
    return {
      inWishlist,
    };
  }

  @Post()
  async addToWishlist(
    @CurrentUser("sub") userId: string,
    @Body() addToWishlistDto: AddToWishlistDto
  ) {
    const item = await this.wishlistService.addToWishlist(
      userId,
      addToWishlistDto
    );
    return {
      message: "Item added to wishlist",
      item,
    };
  }

  @Delete(":id")
  async removeFromWishlist(
    @CurrentUser("sub") userId: string,
    @Param("id") wishlistItemId: string
  ) {
    await this.wishlistService.removeFromWishlist(userId, wishlistItemId);
    return {
      message: "Item removed from wishlist",
    };
  }

  @Delete()
  async clearWishlist(@CurrentUser("sub") userId: string) {
    await this.wishlistService.clearWishlist(userId);
    return {
      message: "Wishlist cleared",
    };
  }
}
