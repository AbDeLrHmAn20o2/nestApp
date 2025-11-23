import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from "@nestjs/common";
import { CouponRepository } from "./repositories/coupon.repository";
import { Coupon, CouponType } from "./entities/coupon.entity";
import { CreateCouponDto } from "./dto/create-coupon.dto";
import { UpdateCouponDto } from "./dto/update-coupon.dto";

@Injectable()
export class CouponService {
  constructor(private couponRepository: CouponRepository) {}

  async create(createCouponDto: CreateCouponDto): Promise<Coupon> {
    const existing = await this.couponRepository.findByCode(
      createCouponDto.code.toUpperCase()
    );

    if (existing) {
      throw new ConflictException("Coupon code already exists");
    }

    return await this.couponRepository.createCoupon({
      ...createCouponDto,
      code: createCouponDto.code.toUpperCase(),
    });
  }

  async findAll(): Promise<Coupon[]> {
    return await this.couponRepository.getAllCoupons();
  }

  async findOne(id: string): Promise<Coupon> {
    const coupon = await this.couponRepository.findOne({ where: { id } });

    if (!coupon) {
      throw new NotFoundException("Coupon not found");
    }

    return coupon;
  }

  async findByCode(code: string): Promise<Coupon> {
    const coupon = await this.couponRepository.findByCode(code.toUpperCase());

    if (!coupon) {
      throw new NotFoundException("Coupon not found");
    }

    return coupon;
  }

  async update(id: string, updateCouponDto: UpdateCouponDto): Promise<Coupon> {
    await this.findOne(id);

    if (updateCouponDto.code) {
      const existing = await this.couponRepository.findByCode(
        updateCouponDto.code.toUpperCase()
      );

      if (existing && existing.id !== id) {
        throw new ConflictException("Coupon code already exists");
      }

      updateCouponDto.code = updateCouponDto.code.toUpperCase();
    }

    return await this.couponRepository.updateCoupon(id, updateCouponDto);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.couponRepository.deleteCoupon(id);
  }

  async validateCoupon(code: string, orderTotal: number): Promise<Coupon> {
    const coupon = await this.findByCode(code);

    if (!coupon.isActive) {
      throw new BadRequestException("Coupon is not active");
    }

    if (coupon.expiresAt && new Date() > new Date(coupon.expiresAt)) {
      throw new BadRequestException("Coupon has expired");
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      throw new BadRequestException("Coupon usage limit reached");
    }

    if (coupon.minPurchaseAmount && orderTotal < coupon.minPurchaseAmount) {
      throw new BadRequestException(
        `Minimum purchase amount of ${coupon.minPurchaseAmount} required`
      );
    }

    return coupon;
  }

  calculateDiscount(coupon: Coupon, orderTotal: number): number {
    let discount = 0;

    if (coupon.type === CouponType.PERCENTAGE) {
      discount = (orderTotal * coupon.value) / 100;

      if (coupon.maxDiscountAmount && discount > coupon.maxDiscountAmount) {
        discount = coupon.maxDiscountAmount;
      }
    } else if (coupon.type === CouponType.FIXED) {
      discount = coupon.value;
    }

    return Math.min(discount, orderTotal);
  }

  async incrementUsage(id: string): Promise<void> {
    await this.couponRepository.incrementUsage(id);
  }
}
