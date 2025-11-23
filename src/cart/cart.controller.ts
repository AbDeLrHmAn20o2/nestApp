import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Patch,
} from "@nestjs/common";
import { CartService } from "./cart.service";
import { AddToCartDto } from "./dto/add-to-cart.dto";
import { UpdateQuantityDto } from "./dto/update-quantity.dto";
import { AuthenticationGuard } from "../common/guards/authentication.guard";
import { CurrentUser } from "../common/decorators/current-user.decorator";

@Controller("cart")
@UseGuards(AuthenticationGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  async getCart(@CurrentUser("sub") userId: string) {
    const items = await this.cartService.getCart(userId);
    const total = await this.cartService.getCartTotal(userId);
    return {
      items,
      total,
      count: items.length,
    };
  }

  @Post()
  async addToCart(
    @CurrentUser("sub") userId: string,
    @Body() addToCartDto: AddToCartDto
  ) {
    const item = await this.cartService.addToCart(userId, addToCartDto);
    return {
      message: "Item added to cart",
      item,
    };
  }

  @Patch(":id/quantity")
  async updateQuantity(
    @CurrentUser("sub") userId: string,
    @Param("id") cartItemId: string,
    @Body() updateQuantityDto: UpdateQuantityDto
  ) {
    const item = await this.cartService.updateQuantity(
      userId,
      cartItemId,
      updateQuantityDto.quantity
    );
    return {
      message: "Cart item quantity updated",
      item,
    };
  }

  @Delete(":id")
  async removeFromCart(
    @CurrentUser("sub") userId: string,
    @Param("id") cartItemId: string
  ) {
    await this.cartService.removeFromCart(userId, cartItemId);
    return {
      message: "Item removed from cart",
    };
  }

  @Delete()
  async clearCart(@CurrentUser("sub") userId: string) {
    await this.cartService.clearCart(userId);
    return {
      message: "Cart cleared",
    };
  }
}
