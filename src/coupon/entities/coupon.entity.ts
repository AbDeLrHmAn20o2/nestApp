import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

export enum CouponType {
  PERCENTAGE = "percentage",
  FIXED = "fixed",
}

@Entity("coupons")
export class Coupon {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ unique: true })
  code: string;

  @Column({
    type: "enum",
    enum: CouponType,
    default: CouponType.PERCENTAGE,
  })
  type: CouponType;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  value: number;

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
  minPurchaseAmount: number;

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
  maxDiscountAmount: number;

  @Column({ nullable: true })
  usageLimit: number;

  @Column({ default: 0 })
  usedCount: number;

  @Column({ type: "timestamp", nullable: true })
  expiresAt: Date;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
