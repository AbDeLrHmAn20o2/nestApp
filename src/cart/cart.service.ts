import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { CartRepository } from "./repositories/cart.repository";
import { ProductService } from "../product/product.service";
import { CartItem } from "./entities/cart-item.entity";
import { AddToCartDto } from "./dto/add-to-cart.dto";

@Injectable()
export class CartService {
  constructor(
    private cartRepository: CartRepository,
    private productService: ProductService
  ) {}

  async getCart(userId: string): Promise<CartItem[]> {
    return await this.cartRepository.findCartByUserId(userId);
  }

  async addToCart(userId: string, addToCartDto: AddToCartDto): Promise<CartItem> {
    const product = await this.productService.findOne(addToCartDto.productId);

    if (!product.isActive) {
      throw new BadRequestException("Product is not available");
    }

    if (product.stock < addToCartDto.quantity) {
      throw new BadRequestException("Insufficient stock");
    }

    const existingItem = await this.cartRepository.findCartItem(
      userId,
      addToCartDto.productId
    );

    if (existingItem) {
      const newQuantity = existingItem.quantity + addToCartDto.quantity;
      if (product.stock < newQuantity) {
        throw new BadRequestException("Insufficient stock");
      }
      return await this.cartRepository.updateQuantity(existingItem.id, newQuantity);
    }

    return await this.cartRepository.addToCart(
      userId,
      addToCartDto.productId,
      addToCartDto.quantity,
      product.price
    );
  }

  async updateQuantity(
    userId: string,
    cartItemId: string,
    quantity: number
  ): Promise<CartItem> {
    const cartItem = await this.cartRepository.findOne({
      where: { id: cartItemId, userId },
      relations: ["product"],
    });

    if (!cartItem) {
      throw new NotFoundException("Cart item not found");
    }

    if (cartItem.product.stock < quantity) {
      throw new BadRequestException("Insufficient stock");
    }

    return await this.cartRepository.updateQuantity(cartItemId, quantity);
  }

  async removeFromCart(userId: string, cartItemId: string): Promise<void> {
    const cartItem = await this.cartRepository.findOne({
      where: { id: cartItemId, userId },
    });

    if (!cartItem) {
      throw new NotFoundException("Cart item not found");
    }

    await this.cartRepository.removeFromCart(cartItemId);
  }

  async clearCart(userId: string): Promise<void> {
    await this.cartRepository.clearCart(userId);
  }

  async getCartTotal(userId: string): Promise<number> {
    return await this.cartRepository.getCartTotal(userId);
  }
}
