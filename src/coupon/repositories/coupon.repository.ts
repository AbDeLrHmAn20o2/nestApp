import { Injectable } from "@nestjs/common";
import { DataSource, Repository } from "typeorm";
import { Coupon } from "../entities/coupon.entity";

@Injectable()
export class CouponRepository extends Repository<Coupon> {
  constructor(private dataSource: DataSource) {
    super(Coupon, dataSource.createEntityManager());
  }

  async createCoupon(data: Partial<Coupon>): Promise<Coupon> {
    const coupon = this.create(data);
    return await this.save(coupon);
  }

  async findByCode(code: string): Promise<Coupon> {
    return await this.findOne({ where: { code } });
  }

  async getAllCoupons(): Promise<Coupon[]> {
    return await this.find({ order: { createdAt: "DESC" } });
  }

  async updateCoupon(id: string, data: Partial<Coupon>): Promise<Coupon> {
    await this.update(id, data);
    return await this.findOne({ where: { id } });
  }

  async incrementUsage(id: string): Promise<void> {
    await this.increment({ id }, "usedCount", 1);
  }

  async deleteCoupon(id: string): Promise<void> {
    await this.delete(id);
  }
}
