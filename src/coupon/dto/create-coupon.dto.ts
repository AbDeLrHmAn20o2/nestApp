import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsNumber,
  IsOptional,
  IsDate,
  IsBoolean,
  Min,
} from "class-validator";
import { Type } from "class-transformer";
import { CouponType } from "../entities/coupon.entity";

export class CreateCouponDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsEnum(CouponType)
  @IsNotEmpty()
  type: CouponType;

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  value: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  minPurchaseAmount?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  maxDiscountAmount?: number;

  @IsNumber()
  @IsOptional()
  @Min(1)
  usageLimit?: number;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  expiresAt?: Date;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
