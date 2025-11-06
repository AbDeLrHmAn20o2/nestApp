import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Otp } from "../entities/otp.entity";

@Injectable()
export class OtpRepository {
  constructor(
    @InjectRepository(Otp)
    private readonly repository: Repository<Otp>
  ) {}

  async create(otpData: Partial<Otp>): Promise<Otp> {
    const otp = this.repository.create(otpData);
    return await this.repository.save(otp);
  }

  async findByEmail(email: string, type: string): Promise<Otp[]> {
    return await this.repository.find({
      where: { email, type, isUsed: false },
      order: { createdAt: "DESC" },
    });
  }

  async markAsUsed(id: string): Promise<void> {
    await this.repository.update(id, { isUsed: true });
  }

  async deleteExpired(): Promise<void> {
    await this.repository
      .createQueryBuilder()
      .delete()
      .where("expiresAt < :now", { now: new Date() })
      .execute();
  }
}
