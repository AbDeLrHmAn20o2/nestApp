import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  UseGuards,
} from "@nestjs/common";
import { CouponService } from "./coupon.service";
import { CreateCouponDto } from "./dto/create-coupon.dto";
import { UpdateCouponDto } from "./dto/update-coupon.dto";
import { ApplyCouponDto } from "./dto/apply-coupon.dto";
import { AuthenticationGuard } from "../common/guards/authentication.guard";
import { AuthorizationGuard } from "../common/guards/authorization.guard";
import { Roles } from "../common/decorators/roles.decorator";

@Controller("coupons")
export class CouponController {
  constructor(private readonly couponService: CouponService) {}

  @Post()
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @Roles("admin")
  async create(@Body() createCouponDto: CreateCouponDto) {
    const coupon = await this.couponService.create(createCouponDto);
    return {
      message: "Coupon created successfully",
      coupon,
    };
  }

  @Get()
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @Roles("admin")
  async findAll() {
    const coupons = await this.couponService.findAll();
    return {
      coupons,
      count: coupons.length,
    };
  }

  @Get(":id")
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @Roles("admin")
  async findOne(@Param("id") id: string) {
    const coupon = await this.couponService.findOne(id);
    return {
      coupon,
    };
  }

  @Post("validate")
  @UseGuards(AuthenticationGuard)
  async validateCoupon(@Body() applyCouponDto: ApplyCouponDto, @Body("orderTotal") orderTotal: number) {
    const coupon = await this.couponService.validateCoupon(
      applyCouponDto.code,
      orderTotal
    );
    const discount = this.couponService.calculateDiscount(coupon, orderTotal);
    return {
      valid: true,
      coupon: {
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
      },
      discount,
      finalTotal: orderTotal - discount,
    };
  }

  @Put(":id")
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @Roles("admin")
  async update(@Param("id") id: string, @Body() updateCouponDto: UpdateCouponDto) {
    const coupon = await this.couponService.update(id, updateCouponDto);
    return {
      message: "Coupon updated successfully",
      coupon,
    };
  }

  @Delete(":id")
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @Roles("admin")
  async remove(@Param("id") id: string) {
    await this.couponService.remove(id);
    return {
      message: "Coupon deleted successfully",
    };
  }
}
